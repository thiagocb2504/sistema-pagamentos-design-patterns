package com.thiago.pagamentos.model;

public class Pagamento {

    private final String cliente;
    private final double valor;
    private final String metodo;

    public Pagamento(String cliente, double valor, String metodo) {
        this.cliente = cliente;
        this.valor = valor;
        this.metodo = metodo;
    }

    public String getCliente() {
        return cliente;
    }

    public double getValor() {
        return valor;
    }

    public String getMetodo() {
        return metodo;
    }

    @Override
    public String toString() {
        return "Pagamento{" +
                "cliente='" + cliente + '\'' +
                ", valor=" + valor +
                ", metodo='" + metodo + '\'' +
                '}';
    }
}