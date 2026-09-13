package org.backend.lessonapp2;

public class DiMain {
	public static void main(String[] args) {
		// 페이서비스의 의존성(디펜던시)
		PointService pointService = new PointService();

		// 디펜던시 넣어주기
		// 디펜던시 인젝션
		// DI
		PayService payService = new PayService(pointService);// , , , , , , , , ,



		ProductService productService = new ProductService(new CountService());
	}
}
