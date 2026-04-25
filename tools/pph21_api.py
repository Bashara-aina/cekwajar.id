"""
FastAPI microservice for PPh21/BPJS calculations.
Decouples complex tax logic from Next.js API routes.
Run: uvicorn tools.pph21_api:app --port 8000
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, Optional

from block_03_pph21_bpjs_engine import (
    PPh21Calculator,
    BPJSCalculator,
    Violation,
)

app = FastAPI(title="cekwajar.id PPh21 Calculator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://cekwajar.id", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class PayslipInput(BaseModel):
    gross_monthly: int
    ptkp_status: Literal["TK0", "K0", "K1", "K2", "K3"]
    npwp: bool
    month: int
    year: int
    city: str
    reported_pph21: Optional[int] = None


class PPh21ResultOut(BaseModel):
    annual_gross: int
    annual_deductible: int
    net_annual: int
    ptkp: int
    pkp: int
    annual_pph21: int
    monthly_pph21: int
    is_ter_method: bool
    violations: list[dict]
    idr_shortfall: Optional[int]


@app.post("/api/v1/pph21/calculate", response_model=PPh21ResultOut)
def calculate_pph21(input: PayslipInput) -> PPh21ResultOut:
    """Calculate annual PPh21 from payslip data."""
    calc = PPh21Calculator(year=input.year)
    result = calc.calculate(
        gross_monthly=input.gross_monthly,
        ptkp_status=input.ptkp_status,
        npwp=input.npwp,
        month=input.month,
        year=input.year,
        city=input.city,
        reported_pph21=input.reported_pph21,
    )
    return PPh21ResultOut(
        annual_gross=result.annual_gross,
        annual_deductible=result.annual_deductible,
        net_annual=result.net_annual,
        ptkp=result.ptkp,
        pkp=result.pkp,
        annual_pph21=result.annual_pph21,
        monthly_pph21=result.monthly_pph21,
        is_ter_method=result.is_ter_method,
        violations=[
            {"code": v.code, "message": v.message, "severity": v.severity}
            for v in result.violations
        ],
        idr_shortfall=result.idr_shortfall,
    )


class BPJSInput(BaseModel):
    gross_monthly: int
    city: str


class BPJSResultOut(BaseModel):
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


@app.post("/api/v1/bpjs/calculate", response_model=BPJSResultOut)
def calculate_bpjs(input: BPJSInput) -> BPJSResultOut:
    """Calculate all BPJS components from monthly gross salary."""
    calc = BPJSCalculator()
    result = calc.calculate_all(gross_monthly=input.gross_monthly, city=input.city)
    return BPJSResultOut(
        jht_employee_monthly=result.jht_employee_monthly,
        jp_employee_monthly=result.jp_employee_monthly,
        bpjs_kesehatan_employee_monthly=result.bpjs_kesehatan_employee_monthly,
        total_employee_monthly=result.total_employee_monthly,
        jht_employer_monthly=result.jht_employer_monthly,
        jp_employer_monthly=result.jp_employer_monthly,
        bpjs_kesehatan_employer_monthly=result.bpjs_kesehatan_employer_monthly,
        tk_employer_monthly=result.tk_employer_monthly,
        total_employer_monthly=result.total_employer_monthly,
        total_contribution_monthly=result.total_contribution_monthly,
    )


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
