package com.thiago.pagamentos.strategy;

import com.thiago.pagamentos.model.Pagamento;
import com.thiago.pagamentos.saida.Saida;

public class PagamentoPix implements MetodoPagamento {

    @Override
    public void pagar(Pagamento pagamento) {

        Saida.println("Processando pagamento via PIX...");

        Saida.printf(
                "PIX de R$ %.2f realizado para %s.%n",
                pagamento.getValor(),
                pagamento.getCliente()
        );
    }
}
