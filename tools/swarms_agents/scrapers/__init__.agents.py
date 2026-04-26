import asyncio
from agents.base_agent import CekwajarBaseAgent, get_supabase


class PropertyScraperAgent(CekwajarBaseAgent):
    def __init__(self):
        super().__init__(
            agent_name="property_scraper",
            description="Scrapes 99.co and Rumah123 for property listing prices",
        )

    async def run(self) -> dict:
        self.log_run("running", 0)
        print("PropertyScraper: Starting scraper")
        await asyncio.sleep(0.5)
        self.log_run("completed", 0)
        return {"listings_scraped": 0, "note": "Requires playwright setup. See README."}


class SalaryScraperAgent(CekwajarBaseAgent):
    def __init__(self):
        super().__init__(
            agent_name="salary_scraper",
            description="Scrapes JobStreet and Karir.com for salary data",
        )

    async def run(self) -> dict:
        self.log_run("running", 0)
        print("SalaryScraper: Starting scraper")
        await asyncio.sleep(0.5)
        self.log_run("completed", 0)
        return {"salary_points": 0, "note": "Requires playwright setup. See README."}


class NumbeoScraperAgent(CekwajarBaseAgent):
    def __init__(self):
        super().__init__(
            agent_name="numbeo_scraper",
            description="Scrapes Numbeo for cost of living data",
        )

    async def run(self) -> dict:
        self.log_run("running", 0)
        print("NumbeoScraper: Starting scraper")
        await asyncio.sleep(0.5)
        self.log_run("completed", 0)
        return {"cities_scraped": 0, "note": "Requires playwright setup. See README."}


async def run_property_scrapers() -> int:
    agent = PropertyScraperAgent()
    result = await agent.run()
    return result.get("listings_scraped", 0)


async def run_jobstreet_scraper() -> int:
    agent = SalaryScraperAgent()
    result = await agent.run()
    return result.get("salary_points", 0)


async def run_numbeo_scraper() -> int:
    agent = NumbeoScraperAgent()
    result = await agent.run()
    return result.get("cities_scraped", 0)


if __name__ == "__main__":
    print("PropertyScraperAgent ready")