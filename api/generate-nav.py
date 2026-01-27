from http.server import BaseHTTPRequestHandler
import json
import base64
from io import BytesIO
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
import traceback

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

            if not template_base64:
                self.send_error(400, 'No template file provided')
                return

            # Decode the template file
            template_bytes = base64.b64decode(template_base64)
            template_stream = BytesIO(template_bytes)

            # Load the PowerPoint template
            prs = Presentation(template_stream)

            if len(prs.slides) == 0:
                self.send_error(400, 'Template has no slides')
                return

            slide = prs.slides[0]

            # Track what was updated
            updates = []

            # Update RAG status indicators
            rag_updated = self.update_rag_status(slide, rag_status)
            if rag_updated:
                updates.append(f"Updated {rag_updated} RAG indicators")

            # Update quarterly financials table
            fin_updated = self.update_quarterly_financials(slide, quarterly_financials)
            if fin_updated:
                updates.append(f"Updated quarterly financials table")

            # Update company update text
            update_updated = self.update_company_update(slide, company_update)
            if update_updated:
                updates.append(f"Updated company update section")

            # Update exit cases table
            exit_updated = self.update_exit_cases(slide, exit_cases)
            if exit_updated:
                updates.append(f"Updated exit cases table")

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
                'file': output_base64,
                'updates': updates,
                'message': f"Successfully updated: {', '.join(updates)}" if updates else "No updates made - elements not found in template"
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

    def update_rag_status(self, slide, rag_status):
        """Update RAG status indicators by finding colored rectangles"""
        try:
            rag_colors = {
                'Green': RGBColor(77, 191, 175),
                'Amber': RGBColor(255, 192, 0),
                'Red': RGBColor(192, 0, 0),
            }

            updated_count = 0

            # Look for any rectangles that might be RAG indicators
            # They're usually small, horizontal rectangles
            rectangles = []
            for shape in slide.shapes:
                if hasattr(shape, 'shape_type'):
                    # Look for auto shapes (rectangles)
                    if shape.shape_type == 1:  # MSO_SHAPE_TYPE.AUTO_SHAPE
                        # Check if it's small and horizontal (typical for RAG indicators)
                        width = shape.width
                        height = shape.height
                        if height < Inches(0.5) and width < Inches(1.5):
                            rectangles.append(shape)

            # Sort rectangles by position (left to right)
            rectangles.sort(key=lambda s: (s.top, s.left))

            # Map the first 6 small rectangles to RAG status values
            rag_values = [
                rag_status.get('financialsStatus', 'Green'),
                rag_status.get('cashStatus', 'Green'),
                rag_status.get('marketStatus', 'Green'),
                rag_status.get('teamStatus', 'Green'),
                rag_status.get('governanceStatus', 'Green'),
                rag_status.get('overallStatus', 'Green')
            ]

            for i, rect in enumerate(rectangles[:6]):  # Only update first 6
                if i < len(rag_values):
                    status = rag_values[i]
                    color = rag_colors.get(status, RGBColor(128, 128, 128))
                    rect.fill.solid()
                    rect.fill.fore_color.rgb = color
                    updated_count += 1

            return updated_count

        except Exception as e:
            print(f"Error updating RAG status: {e}")
            return 0

    def update_quarterly_financials(self, slide, quarterly_financials):
        """Update the quarterly financials table"""
        if not quarterly_financials:
            return False

        try:
            # Find tables in the slide
            for shape in slide.shapes:
                if shape.has_table:
                    table = shape.table

                    # Look for a table with financial metric names
                    found_metrics = False
                    for row in table.rows:
                        for cell in row.cells:
                            cell_text = cell.text.strip().upper()
                            if cell_text in ['ARR', 'REVENUE', 'GM', 'EBITDA', 'FTES']:
                                found_metrics = True
                                break
                        if found_metrics:
                            break

                    if not found_metrics:
                        continue

                    # This is likely our financials table
                    # Find column headers (periods like Dec-24, Mar-25, etc.)
                    header_row = table.rows[0]
                    period_columns = {}

                    for col_idx, cell in enumerate(header_row.cells):
                        cell_text = cell.text.strip()
                        # Check if this cell contains a period we have data for
                        for period in quarterly_financials.keys():
                            if period in cell_text:
                                period_columns[col_idx] = period
                                break

                    # Update the data rows
                    metrics_map = {
                        'ARR': 'ARR',
                        'REVENUE': 'Revenue',
                        'GM': 'GM',
                        'EBITDA': 'EBITDA',
                        'FTES': 'FTEs'
                    }

                    for row in table.rows[1:]:  # Skip header row
                        first_cell = row.cells[0].text.strip().upper()

                        if first_cell in metrics_map:
                            metric_name = metrics_map[first_cell]

                            # Update cells for each period
                            for col_idx, period in period_columns.items():
                                if col_idx < len(row.cells):
                                    value = quarterly_financials[period].get(metric_name)
                                    if value is not None:
                                        row.cells[col_idx].text = str(value)

                    return True

            return False

        except Exception as e:
            print(f"Error updating quarterly financials: {e}")
            return False

    def update_company_update(self, slide, company_update):
        """Update the company update text box"""
        if not company_update:
            return False

        try:
            # Look for text boxes/shapes containing "Company update" or similar
            for shape in slide.shapes:
                if shape.has_text_frame:
                    text_lower = shape.text.lower()

                    if 'company update' in text_lower or 'company commentary' in text_lower:
                        # Found the company update section
                        text_frame = shape.text_frame

                        # Clear existing paragraphs except first (header)
                        while len(text_frame.paragraphs) > 1:
                            p = text_frame.paragraphs[1]
                            p._element.getparent().remove(p._element)

                        # Keep the header, add updated content
                        if len(text_frame.paragraphs) > 0:
                            # Find where header ends
                            header_para = text_frame.paragraphs[0]

                            # If the first paragraph contains just the header, keep it
                            if 'company update' in header_para.text.lower() and len(header_para.text) < 50:
                                # Add new paragraph for content
                                p = text_frame.add_paragraph()
                            else:
                                # Replace the entire content
                                header_para.text = "Company update"
                                p = text_frame.add_paragraph()
                        else:
                            p = text_frame.add_paragraph()

                        # Clean the update text
                        clean_update = company_update.replace('## Company Update', '').replace('## Company update', '').strip()
                        p.text = clean_update
                        p.font.size = Pt(7)
                        p.level = 0

                        return True

            return False

        except Exception as e:
            print(f"Error updating company update: {e}")
            return False

    def update_exit_cases(self, slide, exit_cases):
        """Update the exit cases table"""
        if not exit_cases:
            return False

        try:
            # Find the exit cases table
            for shape in slide.shapes:
                if shape.has_table:
                    table = shape.table

                    # Check if this table has "Exit case" or "EV/Exit" in headers
                    header_row = table.rows[0]
                    is_exit_table = False

                    for cell in header_row.cells:
                        cell_text = cell.text.lower()
                        if 'exit' in cell_text or 'ev/exit' in cell_text or 'moic' in cell_text:
                            is_exit_table = True
                            break

                    if not is_exit_table:
                        continue

                    # Find column indices
                    col_map = {}
                    for col_idx, cell in enumerate(header_row.cells):
                        cell_lower = cell.text.lower()
                        if 'ev/exit' in cell_lower or 'ev exit' in cell_lower:
                            col_map['ev_exit'] = col_idx
                        elif 'moic' in cell_lower:
                            col_map['moic'] = col_idx
                        elif 'irr' in cell_lower:
                            col_map['irr'] = col_idx
                        elif 'key factor' in cell_lower:
                            col_map['factors'] = col_idx

                    # Update data rows
                    for row in table.rows[1:]:
                        first_cell = row.cells[0].text.strip()

                        # Match scenarios
                        for scenario, data in exit_cases.items():
                            if scenario.lower() in first_cell.lower():
                                # Update cells
                                if 'ev_exit' in col_map and col_map['ev_exit'] < len(row.cells):
                                    row.cells[col_map['ev_exit']].text = str(data.get('EV/Exit', data.get('Multiple', '')))
                                if 'moic' in col_map and col_map['moic'] < len(row.cells):
                                    row.cells[col_map['moic']].text = str(data.get('MOIC', ''))
                                if 'irr' in col_map and col_map['irr'] < len(row.cells):
                                    row.cells[col_map['irr']].text = str(data.get('IRR', ''))
                                if 'factors' in col_map and col_map['factors'] < len(row.cells):
                                    row.cells[col_map['factors']].text = str(data.get('Key factors', ''))
                                break

                    return True

            return False

        except Exception as e:
            print(f"Error updating exit cases: {e}")
            return False
