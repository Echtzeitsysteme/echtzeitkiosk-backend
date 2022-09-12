import pdfKit from 'pdfkit';
import { getRepository } from 'typeorm';

import { config } from 'config/config';
import { CustomerInvoiceType } from 'consts/CustomerInvoice';
import { CustomerInvoice } from 'orm/entities/customerInvoices/CustomerInvoice';
import { CustomerOrder } from 'orm/entities/customerOrders/CustomerOrder';
import { User } from 'orm/entities/users/User';

export const generateCustomerInvoicePDFandPipeToResponse = async (
  res: any,
  user: User,
  customerInvoice: CustomerInvoice,
) => {
  const fontNormal = 'Helvetica';
  const fontBold = 'Helvetica-Bold';
  const companyLogo = './es_logo_gross.jpeg';

  const invoiceRows = [];
  const customerOrderRepository = getRepository(CustomerOrder);

  try {
    const customerOrders = await customerOrderRepository
      .createQueryBuilder('customerOrder')
      .leftJoinAndSelect('customerOrder.customerOrderItems', 'customerOrderItem')
      .leftJoinAndSelect('customerOrderItem.product', 'product')
      .where('customerOrder.customer_invoice_id = :id', { id: customerInvoice.id })
      .orderBy('customerOrder.createdAt', 'ASC')
      .getMany();

    // const customerOrders = await customerOrderRepository.find({
    //   where: {
    //     customerInvoice: customerInvoice,
    //   },
    //   relations: ['customerOrderItems', 'customerOrderItems.product'],
    // });

    let rowId = 1;

    // console.log('customerOrders', customerOrders);

    customerOrders.forEach((customerOrder) => {
      customerOrder.customerOrderItems.forEach((customerOrderItem) => {
        const invoiceRowObject = {
          rowId: rowId,
          orderDate: customerOrder.createdAt.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }),
          product: customerOrderItem.product.productTitle,
          qty: customerOrderItem.quantity,
          unitPrice: customerOrderItem.pricePerUnit,
          subTotal: customerOrderItem.subtotal,
        };

        invoiceRows.push(invoiceRowObject);
        rowId++;
      });
    });
  } catch (error) {
    console.log(error);
  }

  function createPdf() {
    try {
      const pdfDoc = new pdfKit({
        size: 'A4',
      });

      pdfDoc.pipe(res);

      pdfDoc.image(companyLogo, 25, 20, { width: 50, height: 50 });
      pdfDoc.font(fontBold).fontSize(16).text('Echtzeitkiosk', 7, 75);
      if (customerInvoice.customerInvoiceType === CustomerInvoiceType.MONTHLY) {
        pdfDoc.font(fontNormal).fontSize(14).text('Monthly Invoice of Orders', 350, 30, { width: 200 });
        pdfDoc.fontSize(10).text(customerInvoice.customerInvoiceMonthYear, 350, 46, { width: 200 });
      }
      if (customerInvoice.customerInvoiceType === CustomerInvoiceType.AD_HOC) {
        pdfDoc.font(fontNormal).fontSize(14).text('Ad Hoc Invoice', 350, 30, { width: 200 });
        pdfDoc
          .fontSize(10)
          .text(customerInvoice.createdAt.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }), 350, 46, {
            width: 200,
          });
      }

      pdfDoc.font(fontBold).text('Sold by:', 7, 100);
      pdfDoc.font(fontNormal).text('Technische Universität Darmstadt', 7, 115, { width: 250 });
      pdfDoc.text('Fachgebiet Echtzeitsysteme', 7, 130, { width: 250 });
      pdfDoc.text('Merckstraße 25', 7, 145, { width: 250 });
      pdfDoc.text('64283 Darmstadt', 7, 160, { width: 250 });
      pdfDoc.text('+49 6151 16-22350', 7, 175, { width: 250 });
      pdfDoc.text(config.email.supportEmail, 7, 190, { width: 250 });

      pdfDoc.font(fontBold).text('Customer details:', 350, 100);
      pdfDoc
        .font(fontNormal)
        .text(`${Array.from(user.firstName)[0] + '***'} ${Array.from(user.lastName)[0] + '***'} `, 350, 115, {
          width: 250,
        });
      pdfDoc.text(user.username, 350, 130, { width: 250 });
      pdfDoc.text(`${Array.from(user.email)[0] + '***' + user.email.substring(user.email.indexOf('@'))}`, 350, 145, {
        width: 250,
      });

      pdfDoc.text('Invoice No: ' + customerInvoice.id, 350, 195, { width: 250 });
      pdfDoc.text(
        'Created At: ' + customerInvoice.createdAt.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }),
        350,
        210,
        { width: 250 },
      );
      pdfDoc.text('Downloaded At: ' + new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }), 350, 225, {
        width: 250,
      });

      pdfDoc.rect(7, 250, 580, 20).fill('#1e1cc8').stroke('#1e1cc8');
      pdfDoc.fillColor('#fff').text('#', 20, 256, { width: 90 }); // order number
      pdfDoc.text('Order Date', 60, 256, { width: 190 });
      pdfDoc.text('Item Description', 200, 256, { width: 190 });
      pdfDoc.text('Price( € )', 400, 256, { width: 100 });
      pdfDoc.text('Quantity', 450, 256, { width: 100 });
      pdfDoc.text('Subtotal( € )', 500, 256, { width: 100 });

      let productNo = 1;
      let pageNo = 1;
      let y = 256; // TODO change it after the last layout

      // use invoiceRows instead of orderInfo.products
      invoiceRows.forEach((element) => {
        if (pageNo === 1) {
          y = 256 + productNo * 20;
        } else {
          y = 50 + productNo * 20;
        }

        pdfDoc.fillColor('#000').text(element.rowId.toString(), 20, y, { width: 90 }); // order number
        pdfDoc.text(element.orderDate, 60, y, { width: 190 });
        pdfDoc.text(element.product, 200, y, { width: 190 });
        pdfDoc.text(element.unitPrice.toString(), 400, y, { width: 100 });
        pdfDoc.text(element.qty.toString(), 450, y, { width: 100 });
        pdfDoc.text(element.subTotal.toString(), 500, y, { width: 100 });

        productNo++;

        if (pageNo === 1 && productNo > 20) {
          pdfDoc.addPage();
          productNo = 1;
          pageNo++;
          y = 0;
        }
        if (pageNo !== 1 && productNo > 35) {
          pdfDoc.addPage();
          productNo = 1;
          pageNo++;
          y = 0;
        }
      });

      pdfDoc
        .rect(7, 256 + productNo * 20, 560, 0.2)
        .fillColor('#000')
        .stroke('#000');
      productNo++;

      if (y > 500) {
        pdfDoc.addPage({
          margin: 50,
        });
        y = 0;
      }

      pdfDoc.font(fontBold).text('Total:', 350, y + 30);
      pdfDoc.font(fontBold).text(`${customerInvoice.total.toString() + ' €'}`, 450, y + 30);

      pdfDoc.font(fontBold).text('User Balance:', 350, y + 50);
      pdfDoc.font(fontBold).text(`${user.balance.toString() + ' €'}`, 450, y + 50);

      pdfDoc.end();
    } catch (error) {
      console.log('Error occurred', error);
    }
  }

  createPdf();
};
