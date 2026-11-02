package com.thiago.pagamentos;

import com.thiago.pagamentos.chain.ClienteValidator;
import com.thiago.pagamentos.chain.SaldoValidator;
import com.thiago.pagamentos.chain.ValidadorPagamento;
import com.thiago.pagamentos.chain.ValorValidator;
import com.thiago.pagamentos.factory.PagamentoFactory;
import com.thiago.pagamentos.model.Pagamento;
import com.thiago.pagamentos.saida.Saida;
import com.thiago.pagamentos.strategy.MetodoPagamento;

/**
 * Orquestra o fluxo completo: monta a corrente de validação, valida,
 * pede a estratégia à fábrica e executa o pagamento.
 *
 * Usado tanto pelo Main (console) quanto pela API.
 */
public class ProcessadorPagamento {

    private final double saldoDisponivel;

    public ProcessadorPagamento(double saldoDisponivel) {
        this.saldoDisponivel = saldoDisponivel;
    }

    public ResultadoPagamento processar(Pagamento pagamento) {

        Saida.println("\nPagamento solicitado:");
        Saida.println(pagamento.toString());

        ValidadorPagamento valorValidator =
                new ValorValidator();

        ValidadorPagamento clienteValidator =
                new ClienteValidator();

        ValidadorPagamento saldoValidator =
                new SaldoValidator(saldoDisponivel);

        valorValidator
                .definirProximo(clienteValidator)
                .definirProximo(saldoValidator);

        try {

            Saida.println("\nValidando pagamento...");

            valorValidator.validar(pagamento);

            Saida.println(
                    "\n✓ Todas as validações foram aprovadas."
            );

            MetodoPagamento metodoPagamento =
                    PagamentoFactory.criar(
                            pagamento.getMetodo()
                    );

            Saida.println(
                    "\nProcessando pagamento..."
            );

            metodoPagamento.pagar(pagamento);

            Saida.println(
                    "\n✓ Pagamento concluído com sucesso!"
            );

            return ResultadoPagamento.sucesso();

        } catch (IllegalArgumentException e) {

            Saida.println(
                    "\n✗ Pagamento recusado."
            );

            Saida.println(
                    "Motivo: " + e.getMessage()
            );

            return ResultadoPagamento.recusado(e);
        }
    }
}
