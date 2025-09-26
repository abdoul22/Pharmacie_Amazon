<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture {{ $invoice->invoice_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }

        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }

        .company-info h1 {
            color: #2563eb;
            font-size: 24px;
            margin-bottom: 10px;
        }

        .company-info p {
            margin-bottom: 5px;
            color: #666;
        }

        .invoice-info {
            text-align: right;
        }

        .invoice-number {
            font-size: 20px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }

        .invoice-details {
            background: #f8fafc;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 25px;
        }

        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .detail-group h3 {
            color: #374151;
            margin-bottom: 10px;
            font-size: 14px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }

        .detail-group p {
            margin-bottom: 5px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }

        .items-table th {
            background: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 11px;
        }

        .items-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
        }

        .items-table tr:nth-child(even) {
            background: #f9fafb;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 25px;
        }

        .totals-table {
            width: 300px;
        }

        .totals-table td {
            padding: 8px 15px;
            border-bottom: 1px solid #e5e7eb;
        }

        .totals-table tr:last-child td {
            border-bottom: 2px solid #2563eb;
            font-weight: bold;
            font-size: 14px;
            background: #f0f9ff;
        }

        .payment-info {
            background: #ecfdf5;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #22c55e;
            margin-bottom: 20px;
        }

        .payment-info h3 {
            color: #166534;
            margin-bottom: 10px;
        }

        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 10px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
            margin-top: 30px;
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
        }

        .badge-prescription {
            background: #fef3c7;
            color: #92400e;
        }

        .badge-otc {
            background: #d1fae5;
            color: #166534;
        }

        .mauritanian-header {
            text-align: center;
            color: #166534;
            margin-bottom: 10px;
            font-size: 11px;
            font-style: italic;
        }
    </style>
</head>

<body>
    <div class="invoice-container">
        <!-- En-tête mauritanien -->
        <div class="mauritanian-header">
            🇲🇷 République Islamique de Mauritanie - Pharmacie Agréée
        </div>

        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <h1>{{ $company['name'] }}</h1>
                <p><strong>📍 Adresse :</strong> {{ $company['address'] }}</p>
                <p><strong>📞 Téléphone :</strong> {{ $company['phone'] }}</p>
                <p><strong>📧 Email :</strong> {{ $company['email'] }}</p>
                <p><strong>🏥 Licence Pharmacie :</strong> PHM-MR-2025-001</p>
            </div>
            <div class="invoice-info">
                <div class="invoice-number">FACTURE {{ $invoice->invoice_number }}</div>
                <p><strong>Date :</strong> {{ $invoice->invoice_date->format('d/m/Y') }}</p>
                <p><strong>Heure :</strong> {{ $invoice->invoice_time->format('H:i') }}</p>
                <p><strong>Caissier :</strong> {{ $invoice->user->name }}</p>
            </div>
        </div>

        <!-- Détails facture -->
        <div class="invoice-details">
            <div class="details-grid">
                <div class="detail-group">
                    <h3>🧾 Informations Facture</h3>
                    <p><strong>Numéro :</strong> {{ $invoice->invoice_number }}</p>
                    <p><strong>Type :</strong> {{ ucfirst($invoice->type) }}</p>
                    <p><strong>Statut :</strong> {{ $invoice->status_name }}</p>
                    <p><strong>Terminal :</strong> {{ $invoice->pos_terminal ?? 'POS-Web' }}</p>
                </div>
                <div class="detail-group">
                    <h3>👤 Client {{ $invoice->customer_name ? '' : '(Vente Comptoir)' }}</h3>
                    @if($invoice->customer_name)
                    <p><strong>Nom :</strong> {{ $invoice->customer_name }}</p>
                    <p><strong>Téléphone :</strong> {{ $invoice->customer_phone ?? 'Non renseigné' }}</p>
                    <p><strong>Email :</strong> {{ $invoice->customer_email ?? 'Non renseigné' }}</p>
                    @if($invoice->customer_address)
                    <p><strong>Adresse :</strong> {{ $invoice->customer_address }}</p>
                    @endif
                    @else
                    <p><em>Vente au comptoir</em></p>
                    <p><strong>Client :</strong> Anonyme</p>
                    <p><strong>Mode :</strong> Vente directe</p>
                    @endif
                </div>
            </div>
        </div>

        <!-- Tableau des articles -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Article</th>
                    <th class="text-center">Qté</th>
                    <th class="text-right">Prix Unit. (MRU)</th>
                    <th class="text-right">Total (MRU)</th>
                    <th class="text-center">Type</th>
                    <th class="text-center">Lot/DLC</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->items as $item)
                <tr>
                    <td>
                        <strong>{{ $item->product_name }}</strong>
                        @if($item->product_code)
                        <br><small style="color: #6b7280;">Code: {{ $item->product_code }}</small>
                        @endif
                        @if($item->category)
                        <br><small style="color: #2563eb;">{{ $item->category }}</small>
                        @endif
                        @if($item->prescription_notes)
                        <br><small style="color: #dc2626; font-style: italic;">{{ $item->prescription_notes }}</small>
                        @endif
                    </td>
                    <td class="text-center">
                        {{ number_format($item->quantity, 2) }}
                        <br><small>{{ $item->unit }}</small>
                    </td>
                    <td class="text-right">{{ number_format($item->unit_price, 2, ',', ' ') }}</td>
                    <td class="text-right">
                        @if($item->discount_percentage > 0)
                        <del style="color: #6b7280;">{{ number_format($item->total_price, 2, ',', ' ') }}</del><br>
                        {{ number_format($item->net_amount, 2, ',', ' ') }}
                        <br><small style="color: #dc2626;">-{{ $item->discount_percentage }}%</small>
                        @else
                        {{ number_format($item->net_amount, 2, ',', ' ') }}
                        @endif
                    </td>
                    <td class="text-center">
                        @if($item->requires_prescription)
                        <span class="badge badge-prescription">SUR ORD.</span>
                        @else
                        <span class="badge badge-otc">LIBRE</span>
                        @endif
                    </td>
                    <td class="text-center">
                        @if($item->batch_number)
                        <strong>{{ $item->batch_number }}</strong>
                        @if($item->expiry_date)
                        <br><small style="color: #dc2626;">{{ $item->expiry_date->format('m/Y') }}</small>
                        @endif
                        @else
                        <small style="color: #6b7280;">N/A</small>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totaux -->
        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td><strong>Sous-total HT :</strong></td>
                    <td class="text-right">{{ number_format($invoice->subtotal_ht, 2, ',', ' ') }} MRU</td>
                </tr>
                <tr>
                    <td><strong>TVA ({{ $invoice->tva_rate }}%) :</strong></td>
                    <td class="text-right">{{ number_format($invoice->tva_amount, 2, ',', ' ') }} MRU</td>
                </tr>
                <tr>
                    <td><strong>TOTAL TTC :</strong></td>
                    <td class="text-right">{{ number_format($invoice->total_ttc, 2, ',', ' ') }} MRU</td>
                </tr>
                </tbody>
            </table>
        </div>

        <!-- Informations de paiement -->
        <div class="payment-info">
            <h3>💳 Paiement Effectué</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <p><strong>Mode de paiement :</strong> {{ $invoice->payment_method_name }}</p>
                    <p><strong>Montant payé :</strong> {{ number_format($invoice->paid_amount, 2, ',', ' ') }} MRU</p>
                    <p><strong>Statut :</strong> <span style="color: #166534;">✅ PAYÉ</span></p>
                </div>
                <div>
                    @if($invoice->payment_details)
                    @foreach($invoice->payment_details as $key => $value)
                    <p><strong>{{ ucfirst($key) }} :</strong> {{ $value }}</p>
                    @endforeach
                    @endif
                    @if($invoice->customer_phone && in_array($invoice->payment_method, ['bankily', 'masrivi', 'sedad',
                    'click', 'moov_money']))
                    <p><strong>N° Mobile :</strong> {{ $invoice->customer_phone }}</p>
                    @endif
                </div>
            </div>
        </div>

        @if($invoice->notes)
        <div
            style="background: #f0f9ff; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-bottom: 10px;">📝 Notes</h3>
            <p>{{ $invoice->notes }}</p>
        </div>
        @endif

        <!-- Pied de page -->
        <div class="footer">
            <p><strong>Amazon Pharmacie</strong> - Votre santé, notre priorité 🏥</p>
            <p>Facture générée le {{ now()->format('d/m/Y à H:i') }} | Système Amazon POS v1.0</p>
            <p style="margin-top: 10px; color: #dc2626;">
                ⚠️ <strong>Important :</strong> Conservez cette facture pour tout échange ou remboursement.<br>
                Les médicaments sur ordonnance ne peuvent être échangés conformément à la réglementation mauritanienne.
            </p>
            <p style="margin-top: 10px;">
                🇲🇷 <em>Conforme à la réglementation sanitaire mauritanienne - Ministère de la Santé</em>
            </p>
        </div>
    </div>
</body>

</html>