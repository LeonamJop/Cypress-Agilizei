/// <reference types="cypress" />

import { format, prepareLocalStorage } from "../support/utils";

context("Dev finances Agilizei", () => {
  beforeEach(() => {
    cy.visit("https://devfinance-agilizei.netlify.app/", {
      onBeforeLoad: (win) => {
        prepareLocalStorage(win);
      },
    });
  });

  it("Cadastrar entradas", () => {
    cy.get("#transaction .button").click(); //id + class
    cy.get("#description").type("Presente"); //id

    cy.get('[name="amount"]').type(12); //atributo
    cy.get('[type="date"]').type("2022-04-19"); //atributo
    cy.get("button").contains("Salvar").click(); //tipo e valor

    let incomes = 0;
    let expenses = 0;

    cy.get("#data-table tbody tr").each(($el, index, $list) => {
      cy.get($el)
        .find("td.income, td.expense")
        .invoke("text")
        .then((text) => {
          if (text.includes("-")) {
            expenses = expenses + format(text);
          } else {
            incomes = incomes + format(text);
          }
        });
    });

    cy.get("#incomeDisplay")
      .invoke("text")
      .then((text) => {
        let formattedTotalDisplay = format(text);
        let expectedTotal = incomes;

        expect(formattedTotalDisplay).to.eq(expectedTotal);
      });

    cy.get("#transaction tbody tr").should("have.length", 3);
  });

  it("Cadastra saída", () => {
    cy.get("#transaction .button").click(); //id + class
    cy.get("#description").type("Presente"); //id

    cy.get('[name="amount"]').type(-12); //atributo
    cy.get('[type="date"]').type("2022-04-19"); //atributo
    cy.get("button").contains("Salvar").click(); //tipo e valor

    let expenses = 0;

    cy.get("#data-table tbody tr").each(($el, index, $list) => {
      cy.get($el)
        .find("td.income, td.expense")
        .invoke("text")
        .then((text) => {
          if (text.includes("-")) {
            expenses = expenses + format(text);
          }
        });
    });

    cy.get("#expenseDisplay")
      .invoke("text")
      .then((text) => {
        let formattedTotalDisplay = format(text);
        let expectedTotal = expenses;

        expect(formattedTotalDisplay).to.eq(expectedTotal);
      });

    cy.get("#transaction tbody tr").should("have.length", 3);
  });

  it("Remover entradas e saídas", () => {
    // Estratégia 1: voltar para elemento pai, e avançar para um td img attr
    cy.get("td.description")
      .contains("Mesada")
      .parent()
      .find("img[onclick*=remove]")
      .click();

    cy.get("#transaction tbody tr").should("have.length", 1);

    // Estratégia 2: buscar todos os irmão, e buscar o que tem img + attr
    cy.get("td.description")
      .contains("Suco Kapo")
      .siblings()
      .children("img[onclick*=remove]")
      .click();

    cy.get("#transaction tbody tr").should("have.length", 0);
  });

  it("Validar saldo com diversas transações", () => {
    let incomes = 0;
    let expenses = 0;

    cy.get("#data-table tbody tr").each(($el, index, $list) => {
      cy.get($el)
        .find("td.income, td.expense")
        .invoke("text")
        .then((text) => {
          if (text.includes("-")) {
            expenses = expenses + format(text);
          } else {
            incomes = incomes + format(text);
          }
        });
    });

    cy.get("#totalDisplay")
      .invoke("text")
      .then((text) => {
        let formattedTotalDisplay = format(text);
        let expectedTotal = incomes + expenses;

        expect(formattedTotalDisplay).to.eq(expectedTotal);
      });
  });
});
