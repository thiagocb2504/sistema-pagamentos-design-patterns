package com.thiago.pagamentos.strategy;

import com.thiago.pagamentos.model.Pagamento;

public class PagamentoBoleto implements MetodoPagamento {

    @Override
    public void pagar(Pagamento pagamento) {

        System.out.println("Gerando boleto...");

        String codigo = "34191.79001 01043.510047 91020.150008 1";

        System.out.println("Boleto gerado com sucesso.");
        System.out.println("Código: " + codigo);

        System.out.printf(
                "Valor: R$ %.2f%n",
                pagamento.getValor()
        );
    }
}