package com.thiago.pagamentos;

import com.thiago.pagamentos.chain.ClienteValidator;
import com.thiago.pagamentos.chain.SaldoValidator;
import com.thiago.pagamentos.chain.ValidadorPagamento;
import com.thiago.pagamentos.chain.ValorValidator;
import com.thiago.pagamentos.factory.PagamentoFactory;
import com.thiago.pagamentos.model.Pagamento;
import com.thiago.pagamentos.strategy.MetodoPagamento;

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

        System.out.println("\nPagamento solicitado:");
        System.out.println(pagamento);

        ValidadorPagamento valorValidator =
                new ValorValidator();

        ValidadorPagamento clienteValidator =
                new ClienteValidator();

        ValidadorPagamento saldoValidator =
                new SaldoValidator(500.00);

        valorValidator
                .definirProximo(clienteValidator)
                .definirProximo(saldoValidator);

        try {

            System.out.println("\nValidando pagamento...");

            valorValidator.validar(pagamento);

            System.out.println(
                    "\n✓ Todas as validações foram aprovadas."
            );

            MetodoPagamento metodoPagamento =
                    PagamentoFactory.criar(
                            pagamento.getMetodo()
                    );

            System.out.println(
                    "\nProcessando pagamento..."
            );

            metodoPagamento.pagar(pagamento);

            System.out.println(
                    "\n✓ Pagamento concluído com sucesso!"
            );

        } catch (IllegalArgumentException e) {

            System.out.println(
                    "\n✗ Pagamento recusado."
            );

            System.out.println(
                    "Motivo: " + e.getMessage()
            );
        }
    }
}