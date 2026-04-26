import os
import logging
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    return create_client(url, key)


class CekwajarBaseAgent:
    def __init__(self, agent_name: str, description: str):
        self.agent_name = agent_name
        self.description = description
        self.supabase = get_supabase()

    def log_run(
        self,
        status: str,
        records_processed: int = 0,
        error: str | None = None,
    ) -> None:
        try:
            self.supabase.table("agent_run_logs").insert(
                {
                    "agent_name": self.agent_name,
                    "status": status,
                    "records_processed": records_processed,
                    "error_message": error,
                    "run_at": "now()",
                }
            ).execute()
        except Exception as e:
            logger.error(f"Failed to log agent run: {e}")