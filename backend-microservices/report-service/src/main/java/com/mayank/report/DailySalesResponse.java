package com.mayank.report;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
@Data
@Builder
public class DailySalesResponse {
    private LocalDate date;
    private Integer invoicesCount;
    private Double revenue;
}
