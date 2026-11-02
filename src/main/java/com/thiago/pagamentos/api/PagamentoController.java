package com.thiago.pagamentos.api;

import com.thiago.pagamentos.ProcessadorPagamento;
import com.thiago.pagamentos.ResultadoPagamento;
import com.thiago.pagamentos.model.Pagamento;
import com.thiago.pagamentos.saida.LinhaSaida;
import com.thiago.pagamentos.saida.Saida;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pagamentos")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class PagamentoController {

    public record PagamentoRequest(
            String cliente,
            double valor,
            String metodo,
            double saldoDisponivel
    ) {
    }

    public record PagamentoResponse(
            boolean aprovado,
            String motivo,
            String falhouEm,
            List<LinhaSaida> linhas
    ) {
    }

    /** Usado pela interface para saber se a API está no ar. */
    @GetMapping("/status")
    public Map<String, String> status() {
        return Map.of("java", Runtime.version().toString());
    }

    @PostMapping
    public PagamentoResponse processar(@RequestBody PagamentoRequest request) {

        Pagamento pagamento = new Pagamento(
                request.cliente(),
                request.valor(),
                request.metodo()
        );

        Saida.iniciarCaptura();

        ResultadoPagamento resultado;
        List<LinhaSaida> linhas;

        try {
            resultado = new ProcessadorPagamento(request.saldoDisponivel())
                    .processar(pagamento);
        } finally {
            // Sempre encerra, para a thread do servidor não ficar com captura pendurada.
            linhas = Saida.finalizarCaptura();
        }

        return new PagamentoResponse(
                resultado.aprovado(),
                resultado.motivo(),
                resultado.falhouEm(),
                linhas
        );
    }
}
