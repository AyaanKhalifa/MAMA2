if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

document.addEventListener('DOMContentLoaded', () => {
    const markInputs = document.querySelectorAll('.mark-input');
    
    // Auto-calculation logic
    markInputs.forEach(input => {
        input.addEventListener('input', calculateTotals);
    });

    function calculateTotals() {
        for (let i = 1; i <= 4; i++) {
            const inputs = document.querySelectorAll(`.u${i}`);
            let total = 0;
            let hasValue = false;
            
            inputs.forEach(input => {
                if (input.value !== '') {
                    hasValue = true;
                    // Validate input
                    let val = parseFloat(input.value);
                    if (val > 25) {
                        val = 25;
                        input.value = 25;
                    }
                    if (val < 0) {
                        val = 0;
                        input.value = 0;
                    }
                    total += val;
                }
            });

            const totalCell = document.getElementById(`t-u${i}`);
            const percentCell = document.getElementById(`p-u${i}`);

            if (hasValue) {
                totalCell.textContent = total;
                percentCell.textContent = ((total / 175) * 100).toFixed(2);
            } else {
                totalCell.textContent = '';
                percentCell.textContent = '';
            }
        }
    }

    // Fix for inputs printing blank or weirdly formatted: Convert them to static text before capture
    function prepareForExport() {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.setAttribute('value', input.value); // ensure the value attribute reflects the current value
        });
    }

    function resetBodyStylesForExport() {
        const origDisplay = document.body.style.display;
        const origPadding = document.body.style.padding;
        document.body.style.display = 'block';
        document.body.style.padding = '0';
        return { origDisplay, origPadding };
    }

    function restoreBodyStyles(styles) {
        document.body.style.display = styles.origDisplay;
        document.body.style.padding = styles.origPadding;
    }

    // PDF Export Configuration (A4 Landscape)
    document.getElementById('btn-pdf').addEventListener('click', () => {
        const element = document.getElementById('result-sheet');
        prepareForExport();
        
        const originalStyles = resetBodyStylesForExport();
        
        const opt = {
            margin:       0,
            filename:     'Student_Result_Unit_Test.pdf',
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        
        html2pdf().set(opt).from(element).save().then(() => {
            restoreBodyStyles(originalStyles);
        });
    });

    // Image Export Configuration (A4 Aspect Ratio)
    document.getElementById('btn-img').addEventListener('click', () => {
        const element = document.getElementById('result-sheet');
        prepareForExport();
        
        const originalStyles = resetBodyStylesForExport();
        
        html2canvas(element, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#f8f4e6',
            scrollY: 0,
            scrollX: 0
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'Student_Result_Unit_Test.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            restoreBodyStyles(originalStyles);
        });
    });
});
