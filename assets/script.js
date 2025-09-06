// --- IGNORE ---
        const signatureModal = document.getElementById('signatureModal');
        const modalSignaturePad = document.getElementById('modalSignaturePad');
        const modalCtx = modalSignaturePad.getContext('2d');
        let currentCanvasId = null;

        window.onload = function() {
            // Preenche a data e hora atuais automaticamente
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            const hour = now.getHours().toString().padStart(2, '0');
            const minute = now.getMinutes().toString().padStart(2, '0');
            document.getElementById('date_lavratura').value = `${year}-${month}-${day}`;
            document.getElementById('time_lavratura').value = `${hour}:${minute}`;
        
            // Configura os canvas de assinatura para abrir o modal
            const signaturePads = document.querySelectorAll('.signature-pad');
            signaturePads.forEach(pad => {
                // Garante que o canvas principal tem o tamanho correto no carregamento
                pad.width = pad.offsetWidth;
                pad.height = pad.offsetHeight;
                pad.addEventListener('click', () => openSignatureModal(pad.id));
            });
            
            setupModalSignaturePad();
        };

        // Adiciona listener para redimensionamento da janela
        window.addEventListener('resize', () => {
            const signaturePads = document.querySelectorAll('.signature-pad');
            signaturePads.forEach(pad => {
                pad.width = pad.offsetWidth;
                pad.height = pad.offsetHeight;
            });
            modalSignaturePad.width = modalSignaturePad.offsetWidth;
            modalSignaturePad.height = modalSignaturePad.offsetHeight;
        });

        function setupModalSignaturePad() {
            modalCtx.lineWidth = 2;
            modalCtx.lineCap = 'round';
            modalCtx.strokeStyle = '#000';
            
            let isDrawing = false;
            let lastX = 0;
            let lastY = 0;

            function getPosition(e) {
                const rect = modalSignaturePad.getBoundingClientRect();
                return {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
            }

            function draw(e) {
                if (!isDrawing) return;
                const pos = getPosition(e);
                modalCtx.beginPath();
                modalCtx.moveTo(lastX, lastY);
                modalCtx.lineTo(pos.x, pos.y); // <-- Linha corrigida
                modalCtx.stroke();
                [lastX, lastY] = [pos.x, pos.y];
            }

            modalSignaturePad.addEventListener('mousedown', (e) => {
                isDrawing = true;
                const pos = getPosition(e);
                [lastX, lastY] = [pos.x, pos.y];
            });

            modalSignaturePad.addEventListener('mousemove', draw);
            modalSignaturePad.addEventListener('mouseup', () => isDrawing = false);
            modalSignaturePad.addEventListener('mouseout', () => isDrawing = false);

            modalSignaturePad.addEventListener('touchstart', (e) => {
                e.preventDefault();
                isDrawing = true;
                const touch = e.touches[0];
                const pos = getPosition(touch);
                [lastX, lastY] = [pos.x, pos.y];
            });

            modalSignaturePad.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (!isDrawing) return;
                const touch = e.touches[0];
                const pos = getPosition(touch);
                modalCtx.beginPath();
                modalCtx.moveTo(lastX, lastY);
                modalCtx.lineTo(pos.x, pos.y);
                modalCtx.stroke();
                [lastX, lastY] = [pos.x, pos.y];
            });

            modalSignaturePad.addEventListener('touchend', () => isDrawing = false);
            modalSignaturePad.addEventListener('touchcancel', () => isDrawing = false);
        }

        function openSignatureModal(canvasId) {
            currentCanvasId = canvasId;
            signatureModal.classList.remove('hidden');
            // Redimensiona o canvas para o tamanho do modal
            modalSignaturePad.width = modalSignaturePad.offsetWidth;
            modalSignaturePad.height = modalSignaturePad.offsetHeight;
            clearModalSignature();
        }

        function confirmSignature() {
            if (currentCanvasId) {
                const mainCanvas = document.getElementById(currentCanvasId);
                const mainCtx = mainCanvas.getContext('2d');
                
                // Redimensiona o canvas principal para o tamanho correto
                mainCanvas.width = mainCanvas.offsetWidth;
                mainCanvas.height = mainCanvas.offsetHeight;

                // Copia a assinatura do modal para o canvas principal
                const signatureImage = new Image();
                signatureImage.onload = function() {
                    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
                    mainCtx.drawImage(signatureImage, 0, 0, mainCanvas.width, mainCanvas.height);
                };
                signatureImage.src = modalSignaturePad.toDataURL();
            }
            signatureModal.classList.add('hidden');
        }

        function clearModalSignature() {
            modalCtx.clearRect(0, 0, modalSignaturePad.width, modalSignaturePad.height);
        }