package com.thiago.pagamentos.adapter;

import com.thiago.pagamentos.saida.Saida;

public class GatewayPayPal {

    public void sendPayment(
            double amount,
            String customerName
    ) {

        Saida.println(
                "Conectando ao gateway externo do PayPal..."
        );

        Saida.printf(
                "PayPal: pagamento de USD %.2f processado para %s.%n",
                amount,
                customerName
        );

        Saida.println(
                "Pagamento aprovado pelo PayPal."
        );
    }
}