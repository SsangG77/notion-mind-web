import { NextRequest } from "next/server";
import { devGate } from "@/lib/devMode";
import { handleGateRequest } from "@/lib/gate";

// 비밀번호 확인(열기)과 해제(끄기)만 한다. 어느 요금제로 볼지는 주소의 dev 파라미터가 정한다.
// 환경변수가 없으면 이 경로는 존재하지 않는 것처럼 404.
export async function POST(req: NextRequest) {
  return handleGateRequest(devGate, req);
}
