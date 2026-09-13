package org.backend.lessonapp2;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductController {
	@Autowired
	public ProductService productService;

	@GetMapping("/product")
	public String get(){
		return "Ok";
	}
}
