package org.backend.lessonapp2;

import org.springframework.stereotype.Component;

public class PayService {
	public PointService pointService;
	public PayService(PointService pointService){
		this.pointService = pointService;
	}
}
