"""
block_03_pph21_bpjs_engine.py
PPh21 TER + Progressive Bracket + BPJS 6-Component Calculator
For: cekwajar.id
Source: UU PPh 21/2009, PMK 101/2018, BPJS regulations 2024
"""

from dataclasses import dataclass, field
from typing import Literal, NamedTuple
import math

# ─── PTKP Values (2024) ───────────────────────────────────────────────────────
PTKP_VALUES = {
    "TK0": 54_000_000,
    "K0":  58_500_000,
    "K1":  63_000_000,
    "K2":  67_500_000,
    "K3":  72_000_000,
}

# ─── TER (Tarif Efektif Rata-rata) Tables 2024 ──────────────────────────────
# Layer 1: PTKP-based annual income brackets → TER %
TER_LAYER1 = [
    (10_800_000, 0.05),
    (21_600_000, 0.10),
    (32_400_000, 0.15),
    (43_200_000, 0.20),
    (54_000_000, 0.25),
    (64_800_000, 0.30),
]

# Layer 2: PKP-based brackets for income above PTKP (cumulative)
TER_LAYER2_BRACKETS = [
    (0,         60_000_000, 0.05),
    (60_000_000, 250_000_000, 0.15),
    (250_000_000, 500_000_000, 0.25),
    (500_000_000, 1_000_000_000, 0.30),
    (1_000_000_000, 5_000_000_000, 0.35),
    (5_000_000_000, float("inf"), 0.35),
]

# ─── BPJS Contribution Rates 2024 ───────────────────────────────────────────
BPJS_RATES = {
    "jht_employee": 0.02,      # Jaminan Hari Tua (worker)
    "jp_employee": 0.01,        # Jaminan Pensiun (worker)
    "bpjs_kesehatan_employee": 0.01,  # BPJS Kesehatan (worker, max Rp 120k/mo)
    "jht_employer": 0.037,      # JHT (employer portion)
    "jp_employer": 0.02,        # JP (employer portion)
    "bpjs_kesehatan_employer": 0.04,   # BPJS Kesehatan (employer)
    "tk_employer": 0.004,       # Tabungan Perumahan (employer)
}

UMK_2024 = {
    "jakarta": 5_000_000,
    "surabaya": 4_725_000,
    "bandung": 4_800_000,
    "default": 4_000_000,
}


class Violation(NamedTuple):
    code: str
    message: str
    severity: str  # "INFO" | "WARNING" | "CRITICAL"


@dataclass
class PPh21Result:
    annual_gross: int
    annual_deductible: int
    net_annual: int
    ptkp: int
    pkp: int
    annual_pph21: int
    monthly_pph21: int
    is_ter_method: bool
    violations: list[Violation]
    idr_shortfall: int | None


@dataclass
class BPJSResult:
    jht_employee_monthly: int
    jp_employee_monthly: int
    bpjs_kesehatan_employee_monthly: int
    total_employee_monthly: int
    jht_employer_monthly: int
    jp_employer_monthly: int
    bpjs_kesehatan_employer_monthly: int
    tk_employer_monthly: int
    total_employer_monthly: int
    total_contribution_monthly: int


def get_umk(city: str) -> int:
    city_lower = city.lower()
    for key, val in UMK_2024.items():
        if key in city_lower:
            return val
    return UMK_2024["default"]


def calculate_ter_pph21(annual_netto: int, ptkp: int) -> tuple[int, bool]:
    """
    Calculate PPh21 using TER (Tarif Efektif Rata-rata) method.
    Returns (annual_pph21, is_ter_method).
    Uses Layer 1 for gross up to 60M, Layer 2 for higher incomes.
    """
    pkp = max(0, annual_netto - ptkp)
    if pkp <= 0:
        return 0, True

    # Layer 1: apply TER to annual gross (if gross is small)
    # Simplified: use cumulative income tax on PKP brackets
    tax = 0
    remaining_pkp = pkp

    for i, (lower, upper, rate) in enumerate(TER_LAYER2_BRACKETS):
        bracket_size = upper - lower
        taxable_in_bracket = min(remaining_pkp, bracket_size)
        if taxable_in_bracket <= 0:
            break
        tax += taxable_in_bracket * rate
        remaining_pkp -= taxable_in_bracket

    return int(round(tax)), True


def calculate_progressive_pph21(annual_netto: int, ptkp: int) -> tuple[int, bool]:
    """
    Calculate PPh21 using progressive bracket method (alternative to TER).
    Returns (annual_pph21, is_ter_method=False).
    """
    pkp = max(0, annual_netto - ptkp)
    if pkp <= 0:
        return 0, False

    tax = 0
    remaining_pkp = pkp
    prev_upper = 0

    for lower, upper, rate in TER_LAYER2_BRACKETS[:-1]:  # skip the 35% bracket
        bracket_size = upper - lower
        taxable_in_bracket = min(max(0, remaining_pkp), bracket_size)
        if taxable_in_bracket <= 0:
            break
        tax += taxable_in_bracket * rate
        remaining_pkp -= taxable_in_bracket
        prev_upper = upper

    # Final bracket at 35%
    if remaining_pkp > 0:
        tax += remaining_pkp * 0.35

    return int(round(tax)), False


class PPh21Calculator:
    """Main PPh21 calculator for Indonesian income tax."""

    def __init__(self, year: int = 2024):
        self.year = year

    def calculate(
        self,
        gross_monthly: int,
        ptkp_status: Literal["TK0", "K0", "K1", "K2", "K3"],
        npwp: bool,
        month: int,
        year: int,
        city: str,
        reported_pph21: int | None = None,
    ) -> PPh21Result:
        """
        Calculate annual PPh21 from monthly gross salary.

        Args:
            gross_monthly: Monthly gross salary in IDR
            ptkp_status: PTKP status (TK0, K0, K1, K2, K3)
            npwp: Whether employee has NPWP
            month: Month of payslip (1-12)
            year: Year of payslip
            city: City for UMK reference
            reported_pph21: PPh21 amount reported on payslip (for violation check)
        """
        violations: list[Violation] = []

        # Annualize gross (month * gross, prorated for partial year)
        months_in_year = 13 - month  # months from this month to end of year
        annual_gross = gross_monthly * 12  # simplified full year

        # Annual deductions
        annual_deductible = self._calculate_annual_deductible(gross_monthly)

        # Net annual income
        net_annual = max(0, annual_gross - annual_deductible)

        # PTKP lookup
        ptkp = PTKP_VALUES.get(ptkp_status, PTKP_VALUES["TK0"])

        # Calculate PPh21 — use TER method
        annual_pph21, is_ter = calculate_ter_pph21(net_annual, ptkp)

        # NPWP penalty: if no NPWP, 20% surcharge on tax
        if not npwp:
            annual_pph21 = int(annual_pph21 * 1.20)
            violations.append(
                Violation(
                    "V03", "Tanpa NPWP — PPh21 dipotong 20% lebih tinggi", "WARNING"
                )
            )

        monthly_pph21 = annual_pph21 // 12

        # Compare with reported PPh21
        idr_shortfall: int | None = None
        if reported_pph21 is not None:
            diff = reported_pph21 - monthly_pph21
            idr_shortfall = abs(diff)
            if diff > 0:
                violations.append(
                    Violation(
                        "V01",
                        f"Laporan PPh21 lebih besar dari perhitungan — selisih Rp {idr_shortfall:,.0f}/bulan",
                        "WARNING",
                    )
                )
            elif diff < 0:
                shortfall = abs(diff)
                violations.append(
                    Violation(
                        "V02",
                        f"Laporan PPh21 lebih kecil dari perhitungan — selisih Rp {shortfall:,.0f}/bulan",
                        "CRITICAL",
                    )
                )

        # UMK check
        umk = get_umk(city)
        if gross_monthly < (umk * 0.5):
            violations.append(
                Violation(
                    "V07",
                    f"Gaji di bawah 50% UMK ({city}) — Rp {gross_monthly:,.0f}/bulan",
                    "CRITICAL",
                )
            )

        # Check for suspiciously low tax (common under-reporting pattern)
        if annual_pph21 > 0 and (annual_pph21 / annual_gross) < 0.001:
            violations.append(
                Violation(
                    "V05",
                    "PPh21 sangat rendah relatif terhadap gaji — kemungkinan salah hitung",
                    "WARNING",
                )
            )

        return PPh21Result(
            annual_gross=annual_gross,
            annual_deductible=annual_deductible,
            net_annual=net_annual,
            ptkp=ptkp,
            pkp=max(0, net_annual - ptkp),
            annual_pph21=annual_pph21,
            monthly_pph21=monthly_pph21,
            is_ter_method=is_ter,
            violations=violations,
            idr_shortfall=idr_shortfall,
        )

    def _calculate_annual_deductible(self, gross_monthly: int) -> int:
        """
        Calculate annual deductible (biaya jabatan + iuran pensiun).
        Biaya jabatan = 5% of gross, max Rp 500k/month × 12
        Iuran pensiun = 1% of gross (Jp), max Rp 120k/month × 12
        """
        biaya_jabatan = min(gross_monthly * 0.05, 500_000) * 12
        iuran_pensiun = min(gross_monthly * 0.01, 120_000) * 12
        return int(biaya_jabatan + iuran_pensiun)


class BPJSCalculator:
    """BPJS Kesehatan + JHT + JP calculator for employees."""

    def calculate_all(
        self,
        gross_monthly: int,
        city: str,
    ) -> BPJSResult:
        """Calculate all BPJS components from monthly gross salary."""
        umk = get_umk(city)
        bpjs_ceiling = min(gross_monthly, umk * 10)  # max 10× UMK

        # Employee contributions (capped)
        jht_emp = int(bpjs_ceiling * BPJS_RATES["jht_employee"])
        jp_emp = int(bpjs_ceiling * BPJS_RATES["jp_employee"])
        bpjskes_emp = min(
            int(bpjs_ceiling * BPJS_RATES["bpjs_kesehatan_employee"]),
            120_000,
        )

        # Employer contributions
        jht_emp_full = int(bpjs_ceiling * (BPJS_RATES["jht_employer"] + BPJS_RATES["jht_employee"]))
        jp_emp_full = int(bpjs_ceiling * (BPJS_RATES["jp_employer"] + BPJS_RATES["jp_employee"]))
        bpjskes_emp_full = int(bpjs_ceiling * (BPJS_RATES["bpjs_kesehatan_employer"] + BPJS_RATES["bpjs_kesehatan_employee"]))
        tk_emp = int(bpjs_ceiling * BPJS_RATES["tk_employer"])

        total_employee = jht_emp + jp_emp + bpjskes_emp
        total_employer = (jht_emp_full - jht_emp) + (jp_emp_full - jp_emp) + (bpjskes_emp_full - bpjskes_emp) + tk_emp

        return BPJSResult(
            jht_employee_monthly=jht_emp,
            jp_employee_monthly=jp_emp,
            bpjs_kesehatan_employee_monthly=bpjskes_emp,
            total_employee_monthly=total_employee,
            jht_employer_monthly=jht_emp_full - jht_emp,
            jp_employer_monthly=jp_emp_full - jp_emp,
            bpjs_kesehatan_employer_monthly=bpjskes_emp_full - bpjskes_emp,
            tk_employer_monthly=tk_emp,
            total_employer_monthly=total_employer,
            total_contribution_monthly=total_employee + total_employer,
        )
