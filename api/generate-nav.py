from http.server import BaseHTTPRequestHandler
import json
import base64
from io import BytesIO
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
import traceback

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            template_base64 = data.get('templateFile')
            rag_status = data.get('ragStatus', {})
            quarterly_financials = data.get('quarterlyFinancials', {})
            company_update = data.get('companyUpdate', '')
            investment_summary = data.get('investmentSummary', {})

            if not template_base64:
                self.send_error(400, 'No template file provided')
                return

            template_bytes = base64.b64decode(template_base64)
            template_stream = BytesIO(template_bytes)
            prs = Presentation(template_stream)

            if len(prs.slides) == 0:
                self.send_error(400, 'Template has no slides')
                return

            slide = prs.slides[0]
            updates = []

            # 1. Update Investment Summary table with manual inputs
            inv_updated = self.update_investment_summary_table(slide, investment_summary)
            if inv_updated:
                updates.append(f"Updated investment summary table")

            # 2. Update RAG status indicators
            rag_updated = self.update_rag_status(slide, rag_status)
            if rag_updated:
                updates.append(f"Updated {rag_updated} RAG indicators")

            # 3. Update quarterly financials table
            fin_updated = self.update_quarterly_financials(slide, quarterly_financials)
            if fin_updated:
                updates.append(f"Updated quarterly financials table")

            # 4. Update company update text
            update_updated = self.update_company_update(slide, company_update)
            if update_updated:
                updates.append(f"Updated company update section")

            # Note: Exit cases and valuation waterfall are left unchanged as requested

            output_stream = BytesIO()
            prs.save(output_stream)
            output_stream.seek(0)

            output_base64 = base64.b64encode(output_stream.read()).decode('utf-8')

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response = {
                'success': True,
                'file': output_base64,
                'updates': updates,
                'message': f"Successfully updated: {', '.join(updates)}" if updates else "No updates made"
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            error_details = traceback.format_exc()
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {
                'success': False,
                'error': str(e),
                'details': error_details
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def update_investment_summary_table(self, slide, investment_summary):
        """Update the Investment Summary table with manual input data"""
        if not investment_summary:
            return False

        try:
            # Find the Investment Summary table - it's the first table after "Investment summary" text
            found_investment_header = False

            for shape in slide.shapes:
                # First find the "Investment summary" text
                if shape.has_text_frame and 'investment summary' in shape.text.lower():
                    found_investment_header = True
                    continue

                # If we found the header, the next table is our target
                if found_investment_header and shape.has_table:
                    table = shape.table

                    # Map field labels to values
                    field_map = {
                        'erve investment': investment_summary.get('erveInvestmentEUR', ''),
                        'break-down by round': investment_summary.get('investmentRound', ''),
                        'breakdown by round': investment_summary.get('investmentRound', ''),
                        'total raised': investment_summary.get('totalRaised', ''),
                        'erve %': investment_summary.get('erveOwnership', ''),
                        'security': investment_summary.get('securityType', ''),
                        'other shareholders': investment_summary.get('otherShareholders', ''),
                        'governance': f"Board Member: {investment_summary.get('boardMember', '')}, Observer: {investment_summary.get('boardObserver', '')}",
                        'cash': investment_summary.get('cash', ''),
                        'monthly burn': investment_summary.get('monthlyBurn', ''),
                        'fume': investment_summary.get('fume', ''),
                        'last pre-/post-money valuation': f"€{investment_summary.get('preMoneyValuation', '')}m / €{investment_summary.get('postMoneyValuation', '')}m" if investment_summary.get('preMoneyValuation') else '',
                    }

                    # Add NAV values with flexible quarter matching
                    # These will match any cell containing 'nav' (case insensitive)
                    current_nav_eur = investment_summary.get('currentQuarterNAV', '')
                    current_nav_usd = investment_summary.get('currentQuarterNAVUSD', '')
                    prior_nav_eur = investment_summary.get('priorQuarterNAV', '')
                    prior_nav_usd = investment_summary.get('priorQuarterNAVUSD', '')

                    # Track NAV cells to update them in order
                    nav_cells = []

                    # Iterate through all cells to find and update matching fields
                    for row in table.rows:
                        for i, cell in enumerate(row.cells):
                            cell_text = cell.text.strip().lower()

                            # Special handling for NAV fields (flexible quarter matching)
                            if 'nav' in cell_text and i + 1 < len(row.cells):
                                nav_cells.append((cell_text, row.cells[i + 1]))
                                continue

                            # Check if this cell contains a field label
                            for field_label, field_value in field_map.items():
                                if field_label in cell_text:
                                    # Update the cell to the right (next cell in row)
                                    if i + 1 < len(row.cells) and field_value:
                                        # For ERVE investment, format as €Xm
                                        if field_label == 'erve investment' and field_value:
                                            row.cells[i + 1].text = f"€{field_value}m"
                                        # For ERVE %, add %
                                        elif field_label == 'erve %' and field_value:
                                            row.cells[i + 1].text = f"{field_value}%"
                                        # For monthly burn, format as €Xm
                                        elif field_label == 'monthly burn' and field_value:
                                            row.cells[i + 1].text = f"€{field_value}m"
                                        # For FUME, add "months"
                                        elif field_label == 'fume' and field_value:
                                            row.cells[i + 1].text = f"{field_value} months"
                                        else:
                                            row.cells[i + 1].text = str(field_value)
                                    break

                    # Update NAV cells - assume they appear in order: current EUR, current USD, prior EUR, prior USD
                    # Or we check for EUR/USD in the label text
                    for label_text, value_cell in nav_cells:
                        # Determine if EUR or USD based on label
                        is_eur = '(eur)' in label_text or '€' in label_text
                        is_usd = '(usd)' in label_text or '$' in label_text or 'usd' in label_text

                        # Try to determine if current or prior quarter
                        # Usually the table has current quarter listed before prior quarter
                        # We'll update the first two NAV cells as current, next two as prior
                        nav_index = nav_cells.index((label_text, value_cell))

                        if nav_index == 0 and current_nav_eur:
                            # First NAV cell - likely current quarter EUR
                            value_cell.text = current_nav_eur
                        elif nav_index == 1 and current_nav_usd:
                            # Second NAV cell - likely current quarter USD
                            value_cell.text = current_nav_usd
                        elif nav_index == 2 and prior_nav_eur:
                            # Third NAV cell - likely prior quarter EUR
                            value_cell.text = prior_nav_eur
                        elif nav_index == 3 and prior_nav_usd:
                            # Fourth NAV cell - likely prior quarter USD
                            value_cell.text = prior_nav_usd
                        elif is_eur and current_nav_eur and 'q4' in label_text:
                            # More specific matching if we can identify the quarter
                            value_cell.text = current_nav_eur
                        elif is_usd and current_nav_usd and 'q4' in label_text:
                            value_cell.text = current_nav_usd
                        elif is_eur and prior_nav_eur and 'q3' in label_text:
                            value_cell.text = prior_nav_eur
                        elif is_usd and prior_nav_usd and 'q3' in label_text:
                            value_cell.text = prior_nav_usd

                    return True

            return False

        except Exception as e:
            print(f"Error updating investment summary table: {e}")
            traceback.print_exc()
            return False

    def update_rag_status(self, slide, rag_status):
        """Update RAG status indicators by finding colored rectangles"""
        try:
            rag_colors = {
                'Green': RGBColor(77, 191, 175),
                'Amber': RGBColor(255, 192, 0),
                'Red': RGBColor(192, 0, 0),
            }

            updated_count = 0
            rectangles = []

            for shape in slide.shapes:
                if hasattr(shape, 'shape_type'):
                    if shape.shape_type == 1:  # Auto shape
                        width = shape.width
                        height = shape.height
                        # RAG indicators are small rectangles
                        if height < Inches(0.5) and width < Inches(1.5):
                            rectangles.append(shape)

            rectangles.sort(key=lambda s: (s.top, s.left))

            rag_values = [
                rag_status.get('financialsStatus', 'Green'),
                rag_status.get('cashStatus', 'Green'),
                rag_status.get('marketStatus', 'Green'),
                rag_status.get('teamStatus', 'Green'),
                rag_status.get('governanceStatus', 'Green'),
                rag_status.get('overallStatus', 'Green')
            ]

            for i, rect in enumerate(rectangles[:6]):
                if i < len(rag_values):
                    status = rag_values[i]
                    color = rag_colors.get(status, RGBColor(128, 128, 128))
                    rect.fill.solid()
                    rect.fill.fore_color.rgb = color
                    updated_count += 1

            return updated_count

        except Exception as e:
            print(f"Error updating RAG status: {e}")
            traceback.print_exc()
            return 0

    def update_quarterly_financials(self, slide, quarterly_financials):
        """Update the quarterly financials table"""
        if not quarterly_financials:
            return False

        try:
            # Find the table with "Quarterly Actuals" or metric names
            for shape in slide.shapes:
                if shape.has_table:
                    table = shape.table

                    # Check if any cell contains "YF 31st Dec" or "Quarterly Actuals"
                    is_financials_table = False
                    for row in table.rows:
                        for cell in row.cells:
                            cell_text = cell.text.strip().lower()
                            if 'yf 31st dec' in cell_text or 'quarterly actual' in cell_text:
                                is_financials_table = True
                                break
                        if is_financials_table:
                            break

                    if not is_financials_table:
                        # Also check for metric names in first column
                        for row in table.rows:
                            first_cell = row.cells[0].text.strip().upper()
                            if first_cell in ['ARR', 'REVENUE', 'GM', 'EBITDA', 'FTES']:
                                is_financials_table = True
                                break

                    if not is_financials_table:
                        continue

                    # This is the financials table - find period columns
                    header_row = table.rows[0]
                    period_columns = {}

                    for col_idx, cell in enumerate(header_row.cells):
                        cell_text = cell.text.strip()
                        for period in quarterly_financials.keys():
                            if period in cell_text:
                                period_columns[col_idx] = period
                                break

                    # Update data rows
                    metrics_map = {
                        'ARR': 'ARR',
                        'REVENUE': 'Revenue',
                        'GM': 'GM',
                        'EBITDA': 'EBITDA',
                        'FTES': 'FTEs'
                    }

                    for row in table.rows[1:]:
                        first_cell = row.cells[0].text.strip().upper()

                        if first_cell in metrics_map:
                            metric_name = metrics_map[first_cell]

                            for col_idx, period in period_columns.items():
                                if col_idx < len(row.cells):
                                    value = quarterly_financials[period].get(metric_name)
                                    if value is not None:
                                        row.cells[col_idx].text = str(value)

                    return True

            return False

        except Exception as e:
            print(f"Error updating quarterly financials: {e}")
            traceback.print_exc()
            return False

    def update_company_update(self, slide, company_update):
        """Update the company update text box in the gray box"""
        if not company_update:
            return False

        try:
            # Find text boxes in gray boxes (usually have gray fill)
            for shape in slide.shapes:
                if shape.has_text_frame:
                    text_lower = shape.text.lower()

                    # Look for "company update" text
                    if 'company update' in text_lower:
                        text_frame = shape.text_frame

                        # Clear existing text - safer approach
                        # Clear text from all existing paragraphs
                        for paragraph in text_frame.paragraphs:
                            paragraph.clear()

                        # Use first paragraph for header
                        if len(text_frame.paragraphs) > 0:
                            p1 = text_frame.paragraphs[0]
                        else:
                            p1 = text_frame.add_paragraph()

                        p1.text = "Company update"
                        p1.font.bold = True
                        p1.font.size = Pt(8)

                        # Add content in second paragraph
                        clean_update = company_update.replace('## Company Update', '').replace('## Company update', '').strip()
                        p2 = text_frame.add_paragraph()
                        p2.text = clean_update
                        p2.font.size = Pt(7)
                        p2.space_before = Pt(6)

                        return True

            return False

        except Exception as e:
            print(f"Error updating company update: {e}")
            traceback.print_exc()
            return False
