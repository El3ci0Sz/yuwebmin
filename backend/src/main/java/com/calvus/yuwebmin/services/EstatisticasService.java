
package com.calvus.yuwebmin.services;

import com.calvus.yuwebmin.dtos.response.DashboardResponseDTO;
import com.calvus.yuwebmin.enums.StatusPedido;
import com.calvus.yuwebmin.repositories.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;

/**
 * Serviço de Estatísticas.
 * Processa as métricas financeiras e de operação para o painel de gestão.
 */
@Service
@RequiredArgsConstructor
public class EstatisticasService {

    private final PedidoRepository pedidoRepository;

    public DashboardResponseDTO gerarDashboard() {
        LocalDate hoje = LocalDate.now();
        LocalDateTime inicioDia = hoje.atStartOfDay();
        LocalDateTime fimDia = hoje.atTime(LocalTime.MAX); // 23:59:59

        YearMonth mesAtual = YearMonth.from(hoje);
        LocalDateTime inicioMes = mesAtual.atDay(1).atStartOfDay();
        LocalDateTime fimMes = mesAtual.atEndOfMonth().atTime(LocalTime.MAX);

        DashboardResponseDTO dashboard = new DashboardResponseDTO();

        // Faturamento e Vendas do Dia Atual
        dashboard.setTotalVendasHoje(
                pedidoRepository.contarPedidosPorPeriodo(StatusPedido.CONCLUIDO, inicioDia, fimDia));
        dashboard.setFaturamentoHoje(
                pedidoRepository.somarFaturamentoPorPeriodo(StatusPedido.CONCLUIDO, inicioDia, fimDia));

        // Faturamento e Vendas do Mês Atual
        dashboard
                .setTotalVendasMes(pedidoRepository.contarPedidosPorPeriodo(StatusPedido.CONCLUIDO, inicioMes, fimMes));
        dashboard.setFaturamentoMes(
                pedidoRepository.somarFaturamentoPorPeriodo(StatusPedido.CONCLUIDO, inicioMes, fimMes));

        // 4. Fila da Cozinha (Pedidos RECEBIDOS ou PREPARANDO)
        long fila = pedidoRepository.countByStatus(StatusPedido.RECEBIDO) +
                pedidoRepository.countByStatus(StatusPedido.PREPARANDO);
        dashboard.setPedidosPendentesCozinha(fila);

        return dashboard;
    }
}