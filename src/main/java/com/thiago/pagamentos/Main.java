package com.thiago.pagamentos;

import com.thiago.pagamentos.model.Pagamento;

public class Main {

    public static void main(String[] args) {

        System.out.println("=================================");
        System.out.println("     SISTEMA DE PAGAMENTOS");
        System.out.println("=================================");

        Pagamento pagamento = new Pagamento(
                "Thiago Brito",
                400.00,
                "CARTAO"
        );

        new ProcessadorPagamento(500.00).processar(pagamento);
    }
}
