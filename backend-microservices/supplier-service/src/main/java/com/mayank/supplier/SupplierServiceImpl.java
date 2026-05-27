package com.mayank.supplier;

import java.util.List;

import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    public SupplierResponse createSupplier(SupplierRequest request) {
        validateRequest(request);

        Supplier supplier = Supplier.builder()
                .name(request.getName().trim())
                .contactPerson(trimOrNull(request.getContactPerson()))
                .email(trimOrNull(request.getEmail()))
                .phone(trimOrNull(request.getPhone()))
                .address(trimOrNull(request.getAddress()))
                .build();

        return map(supplierRepository.save(supplier));
    }

    @Override
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));
        return map(supplier);
    }

    @Override
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        validateRequest(request);

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));

        supplier.setName(request.getName().trim());
        supplier.setContactPerson(trimOrNull(request.getContactPerson()));
        supplier.setEmail(trimOrNull(request.getEmail()));
        supplier.setPhone(trimOrNull(request.getPhone()));
        supplier.setAddress(trimOrNull(request.getAddress()));

        return map(supplierRepository.save(supplier));
    }

    @Override
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));
        supplierRepository.delete(supplier);
    }

    private void validateRequest(SupplierRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Supplier request cannot be null");
        }

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Supplier name is required");
        }
    }

    private String trimOrNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private SupplierResponse map(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .build();
    }
}
