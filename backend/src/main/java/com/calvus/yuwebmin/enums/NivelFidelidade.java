package com.calvus.yuwebmin.enums;

/**
 * Níveis do programa de fidelidade do restaurante.
 */
public enum NivelFidelidade {
    INICIANTE(0), BRONZE(50), PRATA(200), OURO(500), DIAMANTE(1000);

    private final int xpMinimo;

    NivelFidelidade(int xpMinimo) {
        this.xpMinimo = xpMinimo;
    }

    public static NivelFidelidade calcularPorXp(int xp) {
        NivelFidelidade[] valores = values();
        for (int i = valores.length - 1; i >= 0; i--) {
            if (xp >= valores[i].xpMinimo)
                return valores[i];
        }
        return INICIANTE;
    }
}