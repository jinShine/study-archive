package com.buzz.practice;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final PaymentClient paymentClient;

    public String getProducts() {
        String productName = productRepository.findProductName();
        String paymentStatus = paymentClient.ready();
        return "product: " + productName + ", " + paymentStatus;
    }
}
