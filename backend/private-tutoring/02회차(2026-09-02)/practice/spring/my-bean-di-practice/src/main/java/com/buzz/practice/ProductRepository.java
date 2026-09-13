package com.buzz.practice;

import org.springframework.stereotype.Repository;

@Repository
public class ProductRepository {

    public String findProductName() {
        return "keyboard";
    }
}
