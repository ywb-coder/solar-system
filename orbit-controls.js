// OrbitControls 简化实现（基于Three.js r128）
// 如果CDN加载失败，使用此备用实现

(function() {
    if (typeof THREE === 'undefined') {
        console.error('Three.js未加载');
        return;
    }
    
    // 尝试从CDN加载OrbitControls
    if (typeof THREE.OrbitControls === 'undefined') {
        // 使用简化的OrbitControls实现
        THREE.OrbitControls = function(camera, domElement) {
            this.camera = camera;
            this.domElement = domElement || document;
            
            this.enableDamping = false;
            this.dampingFactor = 0.05;
            this.minDistance = 0;
            this.maxDistance = Infinity;
            this.target = new THREE.Vector3();
            
            this.rotateSpeed = 1.0;
            this.zoomSpeed = 1.0;
            this.panSpeed = 1.0;
            
            this.enableRotate = true;
            this.enableZoom = true;
            this.enablePan = true;
            
            this.spherical = new THREE.Spherical();
            this.sphericalDelta = new THREE.Spherical();
            this.scale = 1;
            this.panOffset = new THREE.Vector3();
            
            // 限制垂直旋转角度（防止翻转）
            this.minPolarAngle = 0; // 最小角度（顶部）
            this.maxPolarAngle = Math.PI; // 最大角度（底部）
            
            this.isRotating = false;
            this.isZooming = false;
            this.isPanning = false;
            
            this.rotateStart = new THREE.Vector2();
            this.rotateEnd = new THREE.Vector2();
            this.rotateDelta = new THREE.Vector2();
            this.zoomStart = new THREE.Vector2();
            this.zoomEnd = new THREE.Vector2();
            this.panStart = new THREE.Vector2();
            this.panEnd = new THREE.Vector2();
            
            this.update();
            this.attachListeners();
        };
        
        THREE.OrbitControls.prototype = {
            constructor: THREE.OrbitControls,
            
            attachListeners: function() {
                this.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this), false);
                this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
                this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this), false);
                this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
                this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this), false);
                this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this), false);
            },
            
            onContextMenu: function(event) {
                event.preventDefault();
            },
            
            onMouseDown: function(event) {
                if (!this.enableRotate && !this.enablePan) return;
                
                if (event.button === 0 && this.enableRotate) {
                    this.isRotating = true;
                    this.rotateStart.set(event.clientX, event.clientY);
                } else if (event.button === 2 && this.enablePan) {
                    this.isPanning = true;
                    this.panStart.set(event.clientX, event.clientY);
                }
            },
            
            onMouseWheel: function(event) {
                if (!this.enableZoom) return;
                
                event.preventDefault();
                this.handleMouseDownWheel(event);
                this.handleMouseWheel(event);
            },
            
            handleMouseDownWheel: function(event) {
                this.zoomStart.set(event.clientX, event.clientY);
            },
            
            handleMouseWheel: function(event) {
                const delta = event.deltaY;
                // 反转缩放方向
                if (delta > 0) {
                    this.scale *= 1.1;  // 向下滚动放大
                } else {
                    this.scale /= 1.1;  // 向上滚动缩小
                }
            },
            
            onTouchStart: function(event) {
                if (event.touches.length === 1) {
                    this.isRotating = true;
                    this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                } else if (event.touches.length === 2) {
                    this.isZooming = true;
                    const dx = event.touches[0].pageX - event.touches[1].pageX;
                    const dy = event.touches[0].pageY - event.touches[1].pageY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    this.zoomStart.set(0, distance);
                }
            },
            
            onTouchEnd: function(event) {
                this.isRotating = false;
                this.isZooming = false;
                this.isPanning = false;
            },
            
            onTouchMove: function(event) {
                event.preventDefault();
                if (event.touches.length === 1 && this.isRotating) {
                    this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
                    this.rotateLeft(2 * Math.PI * this.rotateDelta.x / this.domElement.clientWidth * this.rotateSpeed);
                    this.rotateUp(2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight * this.rotateSpeed);
                    this.rotateStart.copy(this.rotateEnd);
                } else if (event.touches.length === 2 && this.isZooming) {
                    const dx = event.touches[0].pageX - event.touches[1].pageX;
                    const dy = event.touches[0].pageY - event.touches[1].pageY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    this.zoomEnd.set(0, distance);
                    const delta = this.zoomEnd.y / this.zoomStart.y;
                    this.scale *= delta;
                    this.zoomStart.copy(this.zoomEnd);
                }
            },
            
            rotateLeft: function(angle) {
                this.sphericalDelta.theta -= angle;
            },
            
            rotateUp: function(angle) {
                // 先更新spherical以获取当前角度
                const offset = new THREE.Vector3();
                offset.copy(this.camera.position).sub(this.target);
                this.spherical.setFromVector3(offset);
                
                // 在应用角度变化前，先检查当前角度
                const currentPhi = this.spherical.phi;
                const newPhi = currentPhi - angle;
                
                // 严格限制phi角度范围，防止相机翻转
                const minPhi = (this.minPolarAngle !== undefined ? this.minPolarAngle : 0) + 0.01;
                const maxPhi = (this.maxPolarAngle !== undefined ? this.maxPolarAngle : Math.PI) - 0.01;
                
                // 只有在不会超出范围时才应用角度变化
                if (newPhi >= minPhi && newPhi <= maxPhi) {
                    this.sphericalDelta.phi -= angle;
                } else {
                    // 如果会超出范围，不应用角度变化，并重置delta
                    this.sphericalDelta.phi = 0;
                }
            },
            
            update: function() {
                const offset = new THREE.Vector3();
                offset.copy(this.camera.position).sub(this.target);
                
                this.spherical.setFromVector3(offset);
                this.spherical.theta += this.sphericalDelta.theta;
                this.spherical.phi += this.sphericalDelta.phi;
                this.spherical.radius *= this.scale;
                
                // 严格限制phi角度范围，防止相机翻转（使用更严格的范围）
                const minPhi = (this.minPolarAngle !== undefined ? this.minPolarAngle : 0) + 0.01;
                const maxPhi = (this.maxPolarAngle !== undefined ? this.maxPolarAngle : Math.PI) - 0.01;
                
                // 限制phi角度，如果超出范围则重置delta
                if (this.spherical.phi < minPhi) {
                    this.spherical.phi = minPhi;
                    this.sphericalDelta.phi = 0;
                } else if (this.spherical.phi > maxPhi) {
                    this.spherical.phi = maxPhi;
                    this.sphericalDelta.phi = 0;
                } else {
                    // 正常范围内，应用限制
                    this.spherical.phi = Math.max(minPhi, Math.min(maxPhi, this.spherical.phi));
                }
                
                // 确保半径不为0，防止相机穿过目标点
                if (this.spherical.radius < 0.01) {
                    this.spherical.radius = 0.01;
                }
                
                // 限制半径范围
                this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
                
                this.target.add(this.panOffset);
                
                offset.setFromSpherical(this.spherical);
                
                // 确保偏移向量有效，防止相机位置异常
                if (offset.length() < 0.01) {
                    // 如果偏移太小，重置为默认位置
                    this.spherical.set(1, Math.PI / 2, 0);
                    offset.setFromSpherical(this.spherical);
                }
                
                this.camera.position.copy(this.target).add(offset);
                this.camera.lookAt(this.target);
                
                if (this.enableDamping) {
                    this.sphericalDelta.theta *= (1 - this.dampingFactor);
                    this.sphericalDelta.phi *= (1 - this.dampingFactor);
                } else {
                    this.sphericalDelta.set(0, 0, 0);
                }
                
                this.scale = 1;
                this.panOffset.set(0, 0, 0);
            }
        };
        
        // 添加鼠标移动和抬起事件
        document.addEventListener('mousemove', function(event) {
            if (window.currentOrbitControls && window.currentOrbitControls.isRotating) {
                window.currentOrbitControls.rotateEnd.set(event.clientX, event.clientY);
                const rotateDelta = new THREE.Vector2().subVectors(
                    window.currentOrbitControls.rotateEnd,
                    window.currentOrbitControls.rotateStart
                );
                // 降低旋转灵敏度
                window.currentOrbitControls.rotateLeft(
                    Math.PI * rotateDelta.x / window.innerWidth * window.currentOrbitControls.rotateSpeed * 0.5
                );
                window.currentOrbitControls.rotateUp(
                    Math.PI * rotateDelta.y / window.innerHeight * window.currentOrbitControls.rotateSpeed * 0.5
                );
                window.currentOrbitControls.rotateStart.copy(window.currentOrbitControls.rotateEnd);
            }
            if (window.currentOrbitControls && window.currentOrbitControls.isPanning) {
                window.currentOrbitControls.panEnd.set(event.clientX, event.clientY);
                const panDelta = new THREE.Vector2().subVectors(
                    window.currentOrbitControls.panEnd,
                    window.currentOrbitControls.panStart
                );
                const element = window.currentOrbitControls.domElement;
                const panLeft = new THREE.Vector3();
                const panUp = new THREE.Vector3();
                panLeft.setFromMatrixColumn(window.currentOrbitControls.camera.matrix, 0);
                panLeft.multiplyScalar(-panDelta.x * window.currentOrbitControls.panSpeed);
                panUp.setFromMatrixColumn(window.currentOrbitControls.camera.matrix, 1);
                panUp.multiplyScalar(panDelta.y * window.currentOrbitControls.panSpeed);
                window.currentOrbitControls.panOffset.add(panLeft).add(panUp);
                window.currentOrbitControls.panStart.copy(window.currentOrbitControls.panEnd);
            }
        });
        
        document.addEventListener('mouseup', function(event) {
            if (window.currentOrbitControls) {
                window.currentOrbitControls.isRotating = false;
                window.currentOrbitControls.isPanning = false;
            }
        });
    }
})();

