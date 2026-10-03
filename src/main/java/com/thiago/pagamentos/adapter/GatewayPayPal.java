package com.thiago.pagamentos.adapter;

public class GatewayPayPal {

    public void sendPayment(
            double amount,
            String customerName
    ) {

        System.out.println(
                "Conectando ao gateway externo do PayPal..."
        );

        System.out.printf(
                "PayPal: pagamento de USD %.2f processado para %s.%n",
                amount,
                customerName
        );

        System.out.println(
                "Pagamento aprovado pelo PayPal."
        );
    }
}