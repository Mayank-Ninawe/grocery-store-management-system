package com.mayank.grocerybackend.inventory;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mayank.grocerybackend.product.ProductResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public List<ProductResponse> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    @GetMapping("/low-stock")
    public List<ProductResponse> getLowStockItems() {
        return inventoryService.getLowStockItems();
    }

    @GetMapping("/summary")
    public InventorySummaryResponse getSummary() {
        return inventoryService.getSummary();
    }

    @PutMapping("/{productId}/stock-in")
    public ProductResponse stockIn(@PathVariable Long productId, @RequestParam Integer qty) {
        return inventoryService.stockIn(productId, qty);
    }

    @PutMapping("/{productId}/stock-out")
    public ProductResponse stockOut(@PathVariable Long productId, @RequestParam Integer qty) {
        return inventoryService.stockOut(productId, qty);
    }
}