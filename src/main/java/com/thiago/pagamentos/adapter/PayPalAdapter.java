package com.thiago.pagamentos.adapter;

public class PayPalAdapter {

    private final GatewayPayPal gateway;

    public PayPalAdapter() {
        this.gateway = new GatewayPayPal();
    }

    public void processarPagamento(
            double valor,
            String cliente
    ) {

        gateway.sendPayment(
                valor,
                cliente
        );
    }
}