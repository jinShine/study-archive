package com.buzz.redis.pipeline;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class PipelineController {

    private final PipelineService pipelineService;

    @GetMapping("/pipeline/compare")
    public Map<String, Object> compare(@RequestParam(defaultValue = "1000") int count) {
        return pipelineService.compare(count);
    }
}
