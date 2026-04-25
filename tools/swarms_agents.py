"""
Swarms agent pipelines for cekwajar.id.
5 agents running on the Linux machine (RTX 3060 for Ollama models).
All agents run through llm_client.chat() for consistency.

Week 4-5: PayslipOCRAgent
Week 6:   BPSDataAgent
Week 7:   PropertyScraperAgent
Week 9:   WorldBankAgent, NumbeoScraperAgent
"""

import asyncio
import json
import os
import re
from typing import Any
from urllib.parse import urljoin

try:
    from playwright.async_playwright import AsyncPlaywright
    from playwright._impl._api_types import TimeoutError as PWTimeoutError
except ImportError:
    AsyncPlaywright = None

import numpy as np
import aiohttp


# ─── Agent 1: Payslip OCR ────────────────────────────────────────────────────

class OCRResult:
    def __init__(
        self,
        confidence: float,
        status: str,  # AUTO_ACCEPT | SOFT_CHECK | MANUAL_REQUIRED
        fields: dict[str, Any],
    ):
        self.confidence = confidence
        self.status = status
        self.fields = fields


def route_ocr_result(result: OCRResult) -> str:
    """Confidence threshold routing from PRD Section 4.3."""
    if result.confidence >= 0.92:
        return "AUTO_ACCEPT"
    elif result.confidence >= 0.80:
        return "SOFT_CHECK"
    return "MANUAL_REQUIRED"


async def extract_payslip_fields(image_base64: str) -> OCRResult:
    """
    Two-stage OCR:
    1. Google Vision API (if key present)
    2. Ollama gemma3:12b fallback (free, local)

    Returns structured fields with per-field confidence.
    """
    if os.getenv("GOOGLE_VISION_API_KEY"):
        return await _google_vision_ocr(image_base64)
    return await _ollama_ocr(image_base64)


async def _google_vision_ocr(image_base64: str) -> OCRResult:
    from google.cloud import vision

    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image_base64)
    response = client.document_text_detection(image=image)
    full_text = (
        response.full_text_annotation.text if response.full_text_annotation else ""
    )
    avg_conf = sum(
        ann.confidence for ann in response.text_annotations
    ) / max(len(response.text_annotations), 1)

    return OCRResult(
        confidence=avg_conf or 0.0,
        status=route_ocr_result(OCRResult(avg_conf or 0.0, "", {})),
        fields=_parse_payslip_fields(full_text),
    )


async def _ollama_ocr(image_base64: str) -> OCRResult:
    """Local Ollama OCR — no API cost, uses gemma3:12b on RTX 3060."""
    try:
        import ollama

        response = await asyncio.wait_for(
            ollama.async_chat(
                model="gemma3:12b",
                messages=[
                    {
                        "role": "user",
                        "content": (
                            "Extract payslip fields from this image. Return ONLY valid JSON "
                            '{"gross_salary":int,"pph21":int,"bpjs_kesehatan":int,'
                            '"net_salary":int,"ptkp_status":"TK0|K0|K1|K2|K3",'
                            '"city":str,"month":int,"year":int}'
                        ),
                        "images": [image_base64],
                    }
                ],
            ),
            timeout=60,
        )
        content = response["message"]["content"]
        # Strip markdown code fences
        content = re.sub(r"```json\s*", "", content.strip())
        content = re.sub(r"```\s*$", "", content.strip())
        data = json.loads(content)
        avg_conf = 0.85  # Ollama doesn't return per-field confidence
        return OCRResult(
            confidence=avg_conf,
            status=route_ocr_result(OCRResult(avg_conf, "", {})),
            fields=data,
        )
    except Exception as e:
        return OCRResult(confidence=0.0, status="MANUAL_REQUIRED", fields={})


def _parse_payslip_fields(full_text: str) -> dict[str, Any]:
    """Parse Indonesian payslip fields using regex patterns."""
    patterns = {
        "gross_salary": r"Gaji\s*(?:Bruto)?\s*:?\s*Rp\.?\s*([\d.]+)",
        "pph21": r"PPh\s*21\s*:?\s*Rp\.?\s*([\d.]+)",
        "bpjs_kesehatan": r"BPJS\s*Kesehatan\s*:?\s*Rp\.?\s*([\d.]+)",
        "net_salary": r"Gaji\s*(?:Bersih|Net)\s*:?\s*Rp\.?\s*([\d.]+)",
    }
    result = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, full_text, re.IGNORECASE)
        if match:
            cleaned = re.sub(r"[^\d]", "", match.group(1))
            result[key] = int(cleaned) if cleaned else None
        else:
            result[key] = None
    return result


# ─── Agent 2: BPS Sakernas Data Loader ──────────────────────────────────────

async def fetch_bps_sakernas(province_code: str) -> list[dict]:
    """
    Downloads and parses BPS Sakernas CSV for salary benchmarks.
    Returns: [{province_code, occupation_code, salary_p50, sample_count}]
    """
    bps_url = f"https://webapi.bps.go.id/v1/rest/sakernas/list/{province_code}"

    async with aiohttp.ClientSession() as session:
        async with session.get(bps_url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
            if resp.status != 200:
                return []
            data = await resp.json()

    records = []
    for row in data.get("data", []):
        records.append({
            "province_code": row.get("province_code"),
            "occupation_code": row.get("occupation_code"),
            "salary_p50": int(row.get("median_salary", 0)),
            "sample_count": int(row.get("n_respondent", 0)),
        })
    return records


# ─── Agent 3: Property Scraper ───────────────────────────────────────────────

class PropertyScraperAgent:
    """Stealth Playwright scraper for 99.co + Rumah123."""

    def __init__(self):
        self._browser = None
        self._playwright = None

    async def _ensure_browser(self):
        if self._browser is None:
            self._playwright = AsyncPlaywright()
            await self._playwright.start()
            self._browser = await self._playwright.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-blink-features=AutomationControlled",
                    "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
                ],
            )
        return self._browser

    async def scrape_99_co(
        self, city: str, property_type: str, max_pages: int = 5
    ) -> list[dict]:
        browser = await self._ensure_browser()
        page = await browser.new_page()
        listings = []

        for page_num in range(1, max_pages + 1):
            url = f"https://www.99.co/id/p/{property_type}/dijual/{city}/?page={page_num}"
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                await page.wait_for_selector(
                    "[data-testid='listing-card']", timeout=10000
                )
            except PWTimeoutError:
                break

            cards = await page.query_selector_all("[data-testid='listing-card']")
            for card in cards:
                price_el = await card.query_selector("[data-testid='price']")
                loc_el = await card.query_selector("[data-testid='location']")
                area_el = await card.query_selector("[data-testid='area']")

                price_text = await price_el.inner_text() if price_el else ""
                area_text = await area_el.inner_text() if area_el else ""
                location = await loc_el.inner_text() if loc_el else ""

                price = self._parse_price(price_text)
                area = self._parse_area(area_text)

                if price and area:
                    listings.append({
                        "price_per_m2": price / area,
                        "kelurahan": location.split(",")[0].strip(),
                        "property_type": property_type,
                        "listing_price": price,
                        "listing_area_m2": area,
                        "source": "99.co",
                    })
            await asyncio.sleep(2)

        await page.close()
        return listings

    def _parse_price(self, text: str) -> int | None:
        cleaned = re.sub(r"[^\d]", "", text)
        return int(cleaned) if cleaned else None

    def _parse_area(self, text: str) -> int | None:
        match = re.search(r"(\d+)\s*m", text)
        return int(match.group(1)) if match else None

    async def close(self):
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()


# ─── Agent 4: World Bank PPP Fetcher ─────────────────────────────────────────

async def fetch_world_bank_ppp(country_code: str = "IDN") -> float | None:
    """Fetch PPP conversion factor from World Bank API."""
    url = f"https://api.worldbank.org/v2/country/{country_code}/indicator/PA.NUS.PPP?format=json"
    async with aiohttp.ClientSession() as session:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
            if resp.status != 200:
                return None
            data = await resp.json()
    try:
        return float(data[1][0]["value"])
    except (IndexError, TypeError, KeyError):
        return None


# ─── Agent 5: Numbeo COL Scraper ────────────────────────────────────────────

NUMBEO_CITIES = {
    "jakarta": "jakarta",
    "surabaya": "surabaya",
    "bandung": "bandung",
    "tangerang": "tangerang",
    "bekasi": "bekasi",
}


async def fetch_numbeo_col(city: str) -> dict[str, float]:
    """
    Fetch cost-of-living basket from Numbeo.
    Returns: 12-item COL basket {meal_inexpensive, meal_midrange, ...
    """
    city_slug = NUMBEO_CITIES.get(city.lower(), city.lower())
    url = f"https://www.numbeo.com/cost-of-living/in/{city_slug}"

    if AsyncPlaywright is None:
        return {}

    async with AsyncPlaywright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"],
        )
        page = await browser.new_page()
        try:
            await page.goto(url, timeout=30000)
            await page.wait_for_selector(".data_wide_table", timeout=10000)
        except Exception:
            await browser.close()
            return {}

        # Parse cost items from tables
        # (simplified — real implementation needs careful DOM parsing)
        await browser.close()
        return {}


# ─── Bayesian Salary Blend ────────────────────────────────────────────────────

def bayesian_blended_p50(
    crowd_p50: int | None,
    crowd_n: int,
    bps_prior: int,
    k: int = 15,
) -> tuple[int, str]:
    """
    BlendedP50 = (n/(n+k)) × CrowdP50 + (k/(n+k)) × BPS_prior

    Confidence badge:
      - 'low': bps_prior used only (n < 10)
      - 'cukup': n < 30
      - 'terverifikasi': n >= 30
    """
    if crowd_n < 10 or crowd_p50 is None:
        return bps_prior, "low"

    weight = crowd_n / (crowd_n + k)
    blended = int((weight * crowd_p50) + ((1 - weight) * bps_prior))
    badge = "terverifikasi" if crowd_n >= 30 else "cukup"
    return blended, badge


def calculate_idr_shortfall(
    expected_annual: int, actual_annual: int
) -> dict[str, Any]:
    """Returns shortfall/surplus for PPh21 violation display."""
    diff = actual_annual - expected_annual
    return {
        "annual_diff_idr": diff,
        "monthly_diff_idr": diff / 12,
        "verdict": (
            "UNDERPAYMENT" if diff > 0 else "OVERPAYMENT" if diff < 0 else "CORRECT"
        ),
        "severity": abs(diff) / expected_annual,
    }


def detect_salary_outliers(
    salary_values: np.ndarray, threshold: float = 3.0
) -> np.ndarray:
    """IQR-based outlier detection for crowdsource salary validation."""
    q1, q3 = np.percentile(salary_values, [25, 75])
    iqr = q3 - q1
    lower = q1 - threshold * iqr
    upper = q3 + threshold * iqr
    return (salary_values < lower) | (salary_values > upper)
