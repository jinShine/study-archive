package com.buzz.redis.stock;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/stock")
public class StockController {

    private final StockService stockService;

    @PostMapping("/reset")
    public String reset(@RequestParam int quantity) {
        stockService.reset(quantity);
        return stockService.get();
    }

    @GetMapping
    public String get() {
        return stockService.get();
    }

    // mode: unsafe | atomic | lua | lock
    @PostMapping("/decrease/{mode}")
    public String decrease(@PathVariable String mode) throws InterruptedException {
        switch (mode) {
            case "unsafe" -> stockService.decreaseUnsafe();
            case "atomic" -> stockService.decreaseAtomic();
            case "lua" -> stockService.decreaseWithLua();
            case "lock" -> stockService.decreaseWithLock();
            default -> throw new IllegalArgumentException("mode는 unsafe, atomic, lua, lock 중 하나");
        }
        return "OK";
    }
}
