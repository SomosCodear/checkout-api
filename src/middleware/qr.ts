import { Application, Operation } from "@joelalejandro/jsonapi-ts";
import { existsSync, readFileSync, writeFileSync } from "fs";
import Jimp from "jimp";
import { Context } from "koa";
import { resolve as resolvePath } from "path";
import * as qr from "qr-image";

import CustomerProcessor from "../resources/customer/processor";
import Customer from "../resources/customer/resource";
import PurchaseProcessor from "../resources/purchase/processor";
import Purchase from "../resources/purchase/resource";
import TicketProcessor from "../resources/ticket/processor";
import Ticket from "../resources/ticket/resource";
import BitmapFonts from "../utils/fonts";

async function centerLine({ text, yStart, canvasWidth, font }) {
  const lineWidth =
    (await Jimp.measureText(font, text)) -
    (text.includes(" ") ? text.split(" ").length - 1 * 16 : 0);

  return {
    text,
    x: Math.floor(canvasWidth / 2 - lineWidth / 2),
    y: yStart
  };
}

async function wordWrap({
  text,
  xBoundary,
  yStart,
  canvasWidth,
  lineHeight,
  font
}: {
  text: string;
  xBoundary: number;
  yStart: number;
  canvasWidth: number;
  lineHeight: number;
  font: any;
}) {
  const lines = [];
  let chars = text.split("");
  let line = "";

  while (chars.length > 0) {
    line += chars.shift();
    let lineWidth = await Jimp.measureText(font, line);
    if (lineWidth >= xBoundary || chars.length === 0) {
      let lastCharIndex = line.lastIndexOf(" ");

      if (lastCharIndex < 0) {
        lastCharIndex = line.length;
      } else {
        chars = [...line.substr(lastCharIndex).trim(), ...chars];
        line = line.substr(0, lastCharIndex).trim();
      }

      lineWidth =
        (await Jimp.measureText(font, line)) -
        (line.includes(" ") ? line.split(" ").length - 1 * 16 : 0);

      lines.push({
        text: line.substr(0, lastCharIndex),
        x: Math.floor(canvasWidth / 2 - lineWidth / 2),
        y: yStart + lineHeight * lines.length
      });

      line = "";
    }
  }

  return lines;
}

export default (application: Application) => {
  const ticketProcessor = application.processorFor({
    ref: { type: "Ticket", id: "", lid: "", relationship: "" }
  } as Operation) as TicketProcessor;

  const customerProcessor = application.processorFor({
    ref: { type: "Customer", id: "", lid: "", relationship: "" }
  } as Operation) as CustomerProcessor;

  const purchaseProcessor = application.processorFor({
    ref: { type: "Purchase", id: "", lid: "", relationship: "" }
  } as Operation) as PurchaseProcessor;

  const ticketAsQRString = (
    ticket: Ticket,
    customer: Customer,
    purchase: Purchase
  ) =>
    [
      customer.attributes.fullName,
      `${customer.attributes.identificationType} ${
        customer.attributes.identificationNumber
      }`,
      ticket.id,
      purchase.attributes.status
    ].join("\n");

  return async function getQR(ctx: Context, next: () => Promise<void>) {
    if (!ctx.request.url.includes("/qr")) {
      return next();
    }

    ctx.set("Content-Type", Jimp.MIME_PNG);

    const ticketFile = resolvePath(
      __dirname,
      `../../tickets/${ctx.request.query.id}`
    );

    if (existsSync(ticketFile)) {
      ctx.body = readFileSync(ticketFile);
      return;
    }

    const ticket = await ticketProcessor.getById(ctx.request.query.id);
    const customer = await customerProcessor.getById(
      ticket.relationships.customer.data.id
    );
    const purchase = await purchaseProcessor.getById(
      ticket.relationships.purchase.data.id
    );

    const qrString = ticketAsQRString(ticket, customer, purchase);

    const qrPng = qr.imageSync(qrString, {
      ec_level: "H",
      type: "png",
      size: 6,
      margin: 0
    });

    const ticketImage = await Jimp.read(
      resolvePath(__dirname, "../assets/ticket-background@3x.png")
    );
    const logo = await Jimp.read(
      resolvePath(__dirname, "../assets/logo@3x.png")
    );
    const qrImage = await Jimp.read(qrPng as Buffer);
    const nameBlock = await wordWrap({
      text: customer.attributes.fullName.toString().toUpperCase(),
      canvasWidth: ticketImage.getWidth(),
      lineHeight: 52,
      xBoundary: 300,
      yStart: 310,
      font: BitmapFonts.Title
    });
    const idLine = await centerLine({
      text: `${customer.attributes.identificationType} ${
        customer.attributes.identificationNumber
      }`,
      canvasWidth: ticketImage.getWidth(),
      yStart: 520,
      font: BitmapFonts.Subtitle
    });

    await Promise.all(
      nameBlock.map(async (line: { text: string; x: number; y: number }) =>
        ticketImage.print(BitmapFonts.TitleShadow, line.x, line.y, line.text)
      )
    );

    await Promise.all(
      nameBlock.map(async (line: { text: string; x: number; y: number }) =>
        ticketImage.print(BitmapFonts.Title, line.x - 2, line.y - 2, line.text)
      )
    );

    await ticketImage.print(
      BitmapFonts.SubtitleShadow,
      idLine.x,
      idLine.y,
      idLine.text
    );

    await ticketImage.print(
      BitmapFonts.Subtitle,
      idLine.x - 2,
      idLine.y - 2,
      idLine.text
    );

    await ticketImage.composite(
      qrImage,
      ticketImage.getWidth() / 2 - qrImage.getWidth() / 2,
      712,
      {
        mode: Jimp.BLEND_MULTIPLY,
        opacitySource: 1,
        opacityDest: 1
      }
    );

    await ticketImage.composite(
      await logo.mask(await logo.grayscale().invert(), 0, 0).brightness(1),
      ticketImage.getWidth() / 2 - logo.getWidth() / 2,
      716 + qrImage.getHeight() / 4
    );

    const ticketBinary = await ticketImage.getBufferAsync(Jimp.MIME_PNG);
    writeFileSync(ticketFile, ticketBinary);

    ctx.body = ticketBinary;
  };
};
