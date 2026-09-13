package org.backend.lessonapp2;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class ProductService {
	private final CountService countService;

	@PostConstruct
	public void 프러덕트서비스가만들어지고디펜던시인젝션됐을때(){
		System.out.println("123123123123123");
		System.out.println("남은재고 관리자에게 이메일전송");
		System.out.println("객체 만들어졌을때 하고싶은 액션");
		System.out.println("토스 결제서버를 호출해서 결제준비 한다던지...");
	}

	@PreDestroy
	public void preDestroy() throws InterruptedException {
		System.out.println("나 파괴되기 직전이에요.");
		System.out.println("캐시에만썼고, 디비에 못쓴 데이터 저장");
		System.out.println("아직 처리중인 작업이 있는지 확인...");
		System.out.println("다 처리후 완료");
		System.out.println("관리자한테 메일 발송");
		Thread.sleep(5000);
		System.out.println("종료");
	}

	// @Autowired
	/*
	public ProductService(CountService countService){
		System.out.println(countService);
		System.out.println("나실행됨");
		this.countService = countService;
	}
	 */

	/*
	@Autowired
	public void setCountService(CountService countService){
		System.out.println("나실행됨");
		System.out.println(countService);
		this.countService = countService;
	}
	 */
}
