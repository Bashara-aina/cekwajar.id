# cekwajar.id Python Agents

Python agents for automated data collection and processing. Built with [swarms](https://github.com/kyegomez/swarms).

## Setup

```bash
cd tools/swarms_agents
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

## Environment Variables

Create `.env` in this directory:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=gsk_...  # Optional — uses MiniMax from swarm-bot if not set
GOOGLE_VISION_API_KEY=...  # Optional — for OCR enhancement
```

## Agents

| Agent | Description |
|-------|-------------|
| `scrapers/property_scraper.py` | Scrapes 99.co + Rumah123 for property prices |
| `scrapers/salary_scraper.py` | Scrapes JobStreet + Karir.com for salary data |
| `scrapers/numbeo_scraper.py` | Scrapes Numbeo for cost of living data |
| `processors/data_validator.py` | Outlier detection, k-anonymity checks |
| `processors/benchmark_aggregator.py` | Builds P25/P50/P75 from raw data |
| `orchestrators/monthly_data_refresh.py` | Monthly full pipeline |

## Running

```bash
# Monthly full pipeline
python -m agents.orchestrators.monthly_data_refresh

# Individual scraper
python -m agents.scrapers.property_scraper

# Schedule (Linux cron)
# 0 6 1 * * cd /path/to/tools/swarms_agents && venv/bin/python -m agents.orchestrators.monthly_data_refresh
```