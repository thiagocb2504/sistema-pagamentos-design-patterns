package com.thiago.pagamentos.strategy;

import com.thiago.pagamentos.model.Pagamento;
import com.thiago.pagamentos.saida.Saida;

public class PagamentoBoleto implements MetodoPagamento {

    @Override
    public void pagar(Pagamento pagamento) {

        Saida.println("Gerando boleto...");

        String codigo = "34191.79001 01043.510047 91020.150008 1";

        Saida.println("Boleto gerado com sucesso.");
        Saida.println("Código: " + codigo);

        Saida.printf(
                "Valor: R$ %.2f%n",
                pagamento.getValor()
        );
    }
}