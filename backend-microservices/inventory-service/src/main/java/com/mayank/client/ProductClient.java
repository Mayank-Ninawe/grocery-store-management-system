package com.mayank.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@FeignClient(name = "product-service")
public interface ProductClient {
    @GetMapping("/api/products")
    List<ProductDto> getAllProducts();

    @GetMapping("/api/products/{id}")
    ProductDto getProductById(@PathVariable("id") Long id);

    @PutMapping("/api/products/{id}")
    ProductDto updateProduct(@PathVariable("id") Long id, @RequestBody ProductDto request);
}