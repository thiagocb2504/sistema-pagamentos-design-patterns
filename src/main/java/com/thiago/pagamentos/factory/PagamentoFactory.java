package com.thiago.pagamentos.factory;

import com.thiago.pagamentos.strategy.MetodoPagamento;
import com.thiago.pagamentos.strategy.PagamentoBoleto;
import com.thiago.pagamentos.strategy.PagamentoCartao;
import com.thiago.pagamentos.strategy.PagamentoPayPal;
import com.thiago.pagamentos.strategy.PagamentoPix;

public class PagamentoFactory {

    private PagamentoFactory() {
    }

    public static MetodoPagamento criar(String metodo) {

        if (metodo == null || metodo.isBlank()) {
            throw new IllegalArgumentException(
                    "Método de pagamento não informado."
            );
        }

        return switch (metodo.toUpperCase()) {

            case "PIX" -> new PagamentoPix();

            case "CARTAO" -> new PagamentoCartao();

            case "BOLETO" -> new PagamentoBoleto();

            case "PAYPAL" -> new PagamentoPayPal();

            default -> throw new IllegalArgumentException(
                    "Método de pagamento inválido: " + metodo
            );
        };
    }
}