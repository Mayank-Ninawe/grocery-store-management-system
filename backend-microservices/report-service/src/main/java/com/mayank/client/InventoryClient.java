package com.mayank.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "inventory-service")
public interface InventoryClient {
    @PutMapping("/api/inventory/{id}/stock-out")
    ProductDto stockOut(@PathVariable("id") Long id, @RequestParam("qty") Integer qty);
}