from http.server import BaseHTTPRequestHandler
import json
import base64
from io import BytesIO
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            # Extract data from request
            template_base64 = data.get('templateFile')
            rag_status = data.get('ragStatus', {})
            quarterly_financials = data.get('quarterlyFinancials', {})
            company_update = data.get('companyUpdate', '')
            exit_cases = data.get('exitCasesTable', {})
            investment_summary = data.get('investmentSummary', {})

            if not template_base64:
                self.send_error(400, 'No template file provided')
                return

            # Decode the template file
            template_bytes = base64.b64decode(template_base64)
            template_stream = BytesIO(template_bytes)

            # Load the PowerPoint template
            prs = Presentation(template_stream)

            # Assuming the template has one slide
            if len(prs.slides) == 0:
                self.send_error(400, 'Template has no slides')
                return

            slide = prs.slides[0]

            # Update RAG status indicators
            self.update_rag_status(slide, rag_status)

            # Update quarterly financials table
            self.update_quarterly_financials(slide, quarterly_financials)

            # Update company update text
            self.update_company_update(slide, company_update)

            # Update exit cases table
            self.update_exit_cases(slide, exit_cases)

            # Save the modified presentation
            output_stream = BytesIO()
            prs.save(output_stream)
            output_stream.seek(0)

            # Encode to base64 for response
            output_base64 = base64.b64encode(output_stream.read()).decode('utf-8')

            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response = {
                'success': True,
                'file': output_base64
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            self.send_error(500, f'Error processing template: {str(e)}')

    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def update_rag_status(self, slide, rag_status):
        """Update RAG status indicators in the template"""
        rag_colors = {
            'Green': RGBColor(77, 191, 175),   # Teal
            'Amber': RGBColor(255, 192, 0),    # Amber
            'Red': RGBColor(192, 0, 0),        # Red
        }

        # Find shapes with names containing 'RAG' or 'Financials', 'Cash', etc.
        rag_indicators = {
            'financialsStatus': 'Financials',
            'cashStatus': 'Cash',
            'marketStatus': 'Market',
            'teamStatus': 'Team',
            'governanceStatus': 'Governance',
            'overallStatus': 'Overall'
        }

        for shape in slide.shapes:
            if not shape.has_text_frame:
                continue

            shape_text = shape.text.strip()

            # Check if this shape's text matches one of our RAG indicator labels
            for status_key, label in rag_indicators.items():
                if shape_text == label:
                    # Find the colored rectangle below this label
                    # Look for a shape at similar X position but slightly lower Y
                    status_value = rag_status.get(status_key, 'Green')
                    color = rag_colors.get(status_value, RGBColor(128, 128, 128))

                    # Find the rectangle shape near this text (usually directly below)
                    for rect_shape in slide.shapes:
                        if rect_shape.shape_type == 1:  # Auto shape (rectangle)
                            # Check if it's positioned near this text
                            x_diff = abs(rect_shape.left - shape.left)
                            y_diff = rect_shape.top - shape.top

                            if x_diff < Inches(0.2) and 0 < y_diff < Inches(0.5):
                                # This is likely the RAG indicator rectangle
                                rect_shape.fill.solid()
                                rect_shape.fill.fore_color.rgb = color
                                break

    def update_quarterly_financials(self, slide, quarterly_financials):
        """Update the quarterly financials table"""
        if not quarterly_financials:
            return

        # Find the table with quarterly financials
        # Look for a table that has headers like 'Dec-24', 'Mar-25', etc.
        for shape in slide.shapes:
            if shape.has_table:
                table = shape.table

                # Check if this is the quarterly financials table
                # by looking for period headers
                header_row = table.rows[0]
                if any('Dec-24' in cell.text or 'Mar-25' in cell.text
                       for cell in header_row.cells):

                    # Update the table data
                    periods = []
                    for col_idx, cell in enumerate(header_row.cells):
                        cell_text = cell.text.strip()
                        if cell_text in quarterly_financials:
                            periods.append((col_idx, cell_text))

                    # Find metric rows (ARR, Revenue, GM, EBITDA, FTEs)
                    metrics = ['ARR', 'Revenue', 'GM', 'EBITDA', 'FTEs']

                    for row_idx, row in enumerate(table.rows[1:], start=1):
                        first_cell = row.cells[0].text.strip()

                        if first_cell in metrics:
                            # Update this row with data
                            for col_idx, period in periods:
                                value = quarterly_financials[period].get(first_cell)
                                if value is not None:
                                    row.cells[col_idx].text = str(value)

    def update_company_update(self, slide, company_update):
        """Update the company update text box"""
        if not company_update:
            return

        # Find the text box with "Company update" header
        for shape in slide.shapes:
            if shape.has_text_frame:
                # Check if this shape contains "Company update" as a title
                if 'Company update' in shape.text:
                    # Clear existing text except the header
                    text_frame = shape.text_frame
                    text_frame.clear()

                    # Add header
                    p = text_frame.paragraphs[0]
                    p.text = 'Company update'
                    p.font.bold = True
                    p.font.size = Pt(8)

                    # Add company update content
                    # Clean up any markdown headers
                    clean_update = company_update.replace('## Company Update', '').strip()
                    clean_update = clean_update.replace('## Company update', '').strip()

                    p2 = text_frame.add_paragraph()
                    p2.text = clean_update
                    p2.font.size = Pt(7)
                    p2.line_spacing = 1.2
                    break

    def update_exit_cases(self, slide, exit_cases):
        """Update the exit cases table"""
        if not exit_cases:
            return

        # Find the exit cases table
        for shape in slide.shapes:
            if shape.has_table:
                table = shape.table

                # Check if this is the exit cases table
                # by looking for "Exit case" header
                header_row = table.rows[0]
                if any('Exit case' in cell.text or 'EV/Exit' in cell.text
                       for cell in header_row.cells):

                    # Update rows with exit case data
                    for row_idx, row in enumerate(table.rows[1:], start=1):
                        first_cell = row.cells[0].text.strip()

                        # Check if this row matches an exit case scenario
                        for scenario, data in exit_cases.items():
                            if scenario in first_cell:
                                # Update the cells in this row
                                if len(row.cells) > 1:
                                    row.cells[1].text = str(data.get('EV/Exit', ''))
                                if len(row.cells) > 2:
                                    row.cells[2].text = str(data.get('MOIC', ''))
                                if len(row.cells) > 3:
                                    row.cells[3].text = str(data.get('IRR', ''))
                                if len(row.cells) > 4:
                                    row.cells[4].text = str(data.get('Key factors', ''))
                                break
