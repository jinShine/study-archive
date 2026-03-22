'use server';

export async function registerDeviceAction(formData: FormData) {
  // 보안 통신 및 암호화 시뮬레이션 (3초 지연)
  console.log("📡 [Action] 보안 기기 등록 요청 수신");
  await new Promise((resolve) => setTimeout(resolve, 3000));
  
  const deviceName = formData.get('deviceName');
  const serialNumber = formData.get('serialNumber');
  
  console.log(`✅ [System] 기기 등록 최종 완료! (모델: ${deviceName}, S/N: ${serialNumber})`);
}