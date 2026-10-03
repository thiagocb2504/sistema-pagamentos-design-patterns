package com.thiago.pagamentos.chain;

import com.thiago.pagamentos.model.Pagamento;

public class SaldoValidator extends ValidadorPagamento {

    private final double saldoDisponivel;

    public SaldoValidator(double saldoDisponivel) {
        this.saldoDisponivel = saldoDisponivel;
    }

    @Override
    protected void validarAtual(Pagamento pagamento) {

        if (pagamento.getValor() > saldoDisponivel) {

            throw new IllegalArgumentException(
                    String.format(
                            "Saldo insuficiente. Saldo disponível: R$ %.2f",
                            saldoDisponivel
                    )
            );
        }

        System.out.println("✓ Saldo validado.");
    }
}