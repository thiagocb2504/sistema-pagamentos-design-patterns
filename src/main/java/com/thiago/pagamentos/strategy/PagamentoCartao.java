package com.thiago.pagamentos.strategy;

import com.thiago.pagamentos.model.Pagamento;
import com.thiago.pagamentos.saida.Saida;

public class PagamentoCartao implements MetodoPagamento {

    @Override
    public void pagar(Pagamento pagamento) {

        Saida.println("Processando pagamento via cartão...");

        Saida.printf(
                "Pagamento de R$ %.2f realizado no cartão para %s.%n",
                pagamento.getValor(),
                pagamento.getCliente()
        );
    }
}