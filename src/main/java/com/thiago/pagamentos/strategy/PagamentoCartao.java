package com.thiago.pagamentos.strategy;

import com.thiago.pagamentos.model.Pagamento;

public class PagamentoCartao implements MetodoPagamento {

    @Override
    public void pagar(Pagamento pagamento) {

        System.out.println("Processando pagamento via cartão...");

        System.out.printf(
                "Pagamento de R$ %.2f realizado no cartão para %s.%n",
                pagamento.getValor(),
                pagamento.getCliente()
        );
    }
}