package com.thiago.pagamentos.strategy;

import com.thiago.pagamentos.adapter.PayPalAdapter;
import com.thiago.pagamentos.model.Pagamento;
import com.thiago.pagamentos.saida.Saida;

public class PagamentoPayPal implements MetodoPagamento {

    private final PayPalAdapter payPalAdapter;

    public PagamentoPayPal() {
        this.payPalAdapter = new PayPalAdapter();
    }

    @Override
    public void pagar(Pagamento pagamento) {

        Saida.println("Processando pagamento via PayPal...");

        payPalAdapter.processarPagamento(
                pagamento.getValor(),
                pagamento.getCliente()
        );
    }
}