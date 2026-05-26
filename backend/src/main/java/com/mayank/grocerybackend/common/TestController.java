package com.mayank.grocerybackend.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class TestController {

  @GetMapping("/api/test")
  public Map<String, String> testApi() {
    return Map.of(
        "status", "success",
        "message", "Grocery backend is running");
  }
}