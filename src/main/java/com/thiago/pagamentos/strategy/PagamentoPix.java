package com.thiago.pagamentos.strategy;

import com.thiago.pagamentos.model.Pagamento;

public class PagamentoPix implements MetodoPagamento {

    @Override
    public void pagar(Pagamento pagamento) {

        System.out.println("Processando pagamento via PIX...");

        System.out.printf(
                "PIX de R$ %.2f realizado para %s.%n",
                pagamento.getValor(),
                pagamento.getCliente()
        );
    }
}
