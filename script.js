// पेज लोड होते ही एक खाली रो (पंक्ति) जोड़ें
window.onload = function() {
    addRow();
};

function addRow() {
    const tbody = document.getElementById('journeyBody');
    const tr = document.createElement('tr');

    tr.innerHTML = `
        <td>
            <div class="fraction-input">
                <input type="time" class="time-input" placeholder="Time">
                <input type="date" class="date-input" placeholder="Date">
            </div>
        </td>
        <td><input type="text" class="from-input" placeholder="से"></td>
        <td><input type="text" class="to-input" placeholder="तक"></td>
        <td><input type="number" class="dist-input" placeholder="Km"></td>
        <td><input type="number" class="fares-input" placeholder="संख्या"></td>
        <td><input type="number" class="fare-paid-input" placeholder="रुपये" oninput="calculateTotal()"></td>
        <td><button type="button" class="remove-btn" onclick="removeRow(this)">X</button></td>
    `;
    tbody.appendChild(tr);
}

function removeRow(btn) {
    const row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
    calculateTotal(); 
}

function calculateTotal() {
    const fareInputs = document.querySelectorAll('.fare-paid-input');
    let total = 0;
    fareInputs.forEach(input => {
        if (input.value) {
            total += parseFloat(input.value);
        }
    });
    document.getElementById('grandTotal').value = total;
}

// PDF जनरेट करने का लॉजिक
async function generatePDF() {
    const name = document.getElementById('empName').value;
    const rank = document.getElementById('empRank').value;
    
    // यहाँ आपके PDF का नाम './form.pdf' सेट है
    const url = './form.pdf'; 
    
    try {
        const existingPdfBytes = await fetch(url).then(res => {
            if (!res.ok) {
                throw new Error("File not found on server.");
            }
            return res.arrayBuffer();
        });
        
        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0]; 
        
        // --- X और Y पोज़िशन (इसे बाद में अपने PDF के हिसाब से सेट करें) ---
        if (name) firstPage.drawText(name, { x: 150, y: 700, size: 12 });
        if (rank) firstPage.drawText(rank, { x: 150, y: 680, size: 12 });

        const rows = document.querySelectorAll('#journeyBody tr');
        let startY = 500; 
        
        rows.forEach((row, index) => {
            const time = row.querySelector('.time-input').value;
            const date = row.querySelector('.date-input').value;
            const from = row.querySelector('.from-input').value;
            const farePaid = row.querySelector('.fare-paid-input').value;
            
            const currentY = startY - (index * 20); 

            if (time) firstPage.drawText(time, { x: 50, y: currentY + 5, size: 10 }); 
            if (date) firstPage.drawText(date, { x: 50, y: currentY - 7, size: 10 }); 
            if (from) firstPage.drawText(from, { x: 120, y: currentY, size: 10 });
            if (farePaid) firstPage.drawText(farePaid, { x: 450, y: currentY, size: 10 });
        });

        const totalFare = document.getElementById('grandTotal').value;
        if(totalFare) {
             firstPage.drawText(totalFare, { x: 450, y: startY - (rows.length * 20) - 10, size: 12 });
        }

        // PDF सेव और डाउनलोड
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "Filled_LTC_Form.pdf";
        link.click();
        
    } catch (error) {
        alert("फ़ाइल नहीं मिली! कृपया सुनिश्चित करें कि गिटहब में आपकी खाली PDF का नाम बिल्कुल 'form.pdf' ही है।");
        console.error(error);
    }
}
