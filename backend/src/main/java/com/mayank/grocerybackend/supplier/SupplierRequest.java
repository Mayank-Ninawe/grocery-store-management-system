package com.mayank.grocerybackend.supplier;

import lombok.Data;

@Data
public class SupplierRequest {
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
}
