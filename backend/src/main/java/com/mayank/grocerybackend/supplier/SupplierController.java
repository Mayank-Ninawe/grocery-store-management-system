package com.mayank.grocerybackend.supplier;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public SupplierResponse createSupplier(@RequestBody SupplierRequest request) {
        return supplierService.createSupplier(request);
    }

    @GetMapping
    public List<SupplierResponse> getAllSuppliers() {
        return supplierService.getAllSuppliers();
    }

    @GetMapping("/{id}")
    public SupplierResponse getSupplierById(@PathVariable Long id) {
        return supplierService.getSupplierById(id);
    }

    @PutMapping("/{id}")
    public SupplierResponse updateSupplier(@PathVariable Long id, @RequestBody SupplierRequest request) {
        return supplierService.updateSupplier(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
    }
}