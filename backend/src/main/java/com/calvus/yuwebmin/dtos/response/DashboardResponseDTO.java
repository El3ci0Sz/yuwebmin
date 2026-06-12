package com.calvus.yuwebmin.dtos.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DashboardResponseDTO {
    private Long totalVendasHoje;
    private BigDecimal faturamentoHoje;

    private Long totalVendasMes;
    private BigDecimal faturamentoMes;

    private Long pedidosPendentesCozinha;
}